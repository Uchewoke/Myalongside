"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
  Send,
  Video,
  VideoOff,
  Phone,
  MoreVertical,
  ArrowLeft,
  Maximize2,
  Minimize2,
  X,
} from "lucide-react";
import Link from "next/link";
import { MOCK_MENTORS, MOCK_CURRENT_USER, MOCK_MESSAGES, type MockMessage } from "@/lib/mock-data";
import { useAuthStore } from "@/store/useAuthStore";
import { getPublicProfile } from "@/lib/public-profile";
import { clsx } from "clsx";

// ─── Video Call Overlay ────────────────────────────────────────────────────────

function VideoCallOverlay({
  roomName,
  participantName,
  onEnd,
}: {
  roomName: string;
  participantName: string;
  onEnd: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={clsx(
        "fixed z-50 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl transition-all duration-300",
        expanded
          ? "inset-4 flex flex-col"
          : "bottom-24 right-6 flex flex-col"
      )}
      style={expanded ? {} : { width: 420, height: 320 }}
    >
      {/* Controls bar */}
      <div className="flex items-center justify-between bg-stone-900 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm font-medium text-white">
            Video call with {participantName}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-700 hover:text-white transition-colors"
            title={expanded ? "Minimize" : "Maximize"}
          >
            {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          <button
            onClick={onEnd}
            className="rounded-lg p-1.5 text-red-400 hover:bg-red-900/40 hover:text-red-300 transition-colors"
            title="End call"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Jitsi iframe */}
      <iframe
        src={`https://meet.jit.si/${roomName}`}
        className="flex-1 w-full border-0"
        allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
        title="Video call"
      />
    </div>
  );
}

// ─── Message Bubble ────────────────────────────────────────────────────────────

function MessageBubble({
  message,
  isMine,
  senderAvatar,
  senderName,
}: {
  message: MockMessage;
  isMine: boolean;
  senderAvatar: string;
  senderName: string;
}) {
  if (message.content.startsWith("__CALL__")) {
    const ended = message.content === "__CALL__ended";
    return (
      <div className="flex justify-center my-2">
        <div className="flex items-center gap-2 rounded-full bg-stone-100 px-4 py-2 text-xs text-stone-500">
          {ended ? (
            <VideoOff className="h-3.5 w-3.5 text-red-400" />
          ) : (
            <Video className="h-3.5 w-3.5 text-brand-500" />
          )}
          {ended ? "Call ended" : "Video call started"} · {message.timestamp}
        </div>
      </div>
    );
  }

  return (
    <div className={clsx("flex items-end gap-2.5", isMine && "flex-row-reverse")}>
      {!isMine && (
        <Image
          src={senderAvatar}
          alt={senderName}
          width={28}
          height={28}
          className="rounded-full bg-stone-100 flex-shrink-0 mb-0.5"
          unoptimized
        />
      )}
      <div
        className={clsx(
          "max-w-[72%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isMine
            ? "rounded-br-sm bg-brand-600 text-white"
            : "rounded-bl-sm bg-white text-stone-800 shadow-sm border border-stone-100"
        )}
      >
        {message.content}
        <p
          className={clsx(
            "mt-1 text-[10px]",
            isMine ? "text-brand-200 text-right" : "text-stone-400"
          )}
        >
          {message.timestamp}
        </p>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const authUser = useAuthStore((state) => state.user);
  const user = authUser ?? MOCK_CURRENT_USER;
  const publicUser = getPublicProfile(user);

  const mentor = MOCK_MENTORS.find((m) => m.id === id) ?? MOCK_MENTORS[0];

  const [messages, setMessages] = useState<MockMessage[]>(MOCK_MESSAGES);
  const [input, setInput] = useState("");
  const [inCall, setInCall] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // stable room name derived from participants — same for both sides
  const roomName = `myalongside-${[user.id, mentor.id].sort().join("-")}`;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage(content: string) {
    if (!content.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        senderId: user.id,
        content: content.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        read: false,
      },
    ]);
    setInput("");
  }

  function startCall() {
    setInCall(true);
    setMessages((prev) => [
      ...prev,
      {
        id: `call-${Date.now()}`,
        senderId: user.id,
        content: "__CALL__started",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        read: false,
      },
    ]);
  }

  function endCall() {
    setInCall(false);
    setMessages((prev) => [
      ...prev,
      {
        id: `call-end-${Date.now()}`,
        senderId: user.id,
        content: "__CALL__ended",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        read: false,
      },
    ]);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <>
      {inCall && (
        <VideoCallOverlay
          roomName={roomName}
          participantName={mentor.name}
          onEnd={endCall}
        />
      )}

      <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-stone-100 px-4 py-3">
          <Link
            href="/chat"
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div className="relative">
            <Image
              src={mentor.avatar}
              alt={mentor.name}
              width={40}
              height={40}
              className="rounded-full bg-stone-100"
              unoptimized
            />
            {mentor.availability === "AVAILABLE" && (
              <span className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-stone-900 text-sm leading-tight">{mentor.name}</p>
            <p className="text-xs text-stone-400">
              {mentor.availability === "AVAILABLE" ? "Online" : "Offline"}
            </p>
          </div>

          <div className="flex items-center gap-1">
            {/* Video call button */}
            <button
              onClick={inCall ? endCall : startCall}
              title={inCall ? "End video call" : "Start video call"}
              className={clsx(
                "flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all",
                inCall
                  ? "bg-red-50 text-red-600 hover:bg-red-100"
                  : "bg-brand-50 text-brand-700 hover:bg-brand-100"
              )}
            >
              {inCall ? (
                <>
                  <VideoOff className="h-4 w-4" />
                  <span className="hidden sm:inline">End Call</span>
                </>
              ) : (
                <>
                  <Video className="h-4 w-4" />
                  <span className="hidden sm:inline">Video Call</span>
                </>
              )}
            </button>

            <button
              className="rounded-xl p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors"
              title="Call"
            >
              <Phone className="h-4 w-4" />
            </button>

            <button
              className="rounded-xl p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors"
              title="More options"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 p-4">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isMine={msg.senderId === user.id}
              senderAvatar={mentor.avatar}
              senderName={mentor.name}
            />
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-stone-100 p-3">
          <div className="flex items-end gap-2">
            <button
              onClick={inCall ? endCall : startCall}
              title={inCall ? "End video call" : "Start video call"}
              className={clsx(
                "flex-shrink-0 rounded-xl p-2.5 transition-colors",
                inCall
                  ? "bg-red-100 text-red-600 hover:bg-red-200"
                  : "text-stone-400 hover:bg-brand-50 hover:text-brand-600"
              )}
            >
              <Video className="h-5 w-5" />
            </button>

            <textarea
              className="input-field flex-1 resize-none min-h-[42px] max-h-[120px] !py-2.5 leading-relaxed"
              placeholder={`Message ${mentor.name}…`}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />

            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim()}
              className="flex-shrink-0 rounded-xl bg-brand-600 p-2.5 text-white shadow-sm transition-all hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-1.5 text-center text-[10px] text-stone-400">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </>
  );
}
