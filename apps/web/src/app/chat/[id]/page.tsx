"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import { useAuthStore } from "@/store/useAuthStore";
import { avatarOrFallback } from "@/lib/avatar";
import { clsx } from "clsx";

const POLL_INTERVAL_MS = 4000;

interface Participant {
  id: string;
  name: string;
  avatar: string | null;
  mentorProfile?: { tagline: string; isAvailable: boolean } | null;
}

interface ConversationMessage {
  id: string;
  content: string;
  type: "TEXT" | "SYSTEM";
  readAt: string | null;
  createdAt: string;
  sender: Participant;
}

interface ConversationData {
  id: string;
  match: {
    seekerId: string;
    mentorId: string;
    status: string;
    seeker: Participant;
    mentor: Participant;
  };
  messages: ConversationMessage[];
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

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
  message: ConversationMessage;
  isMine: boolean;
  senderAvatar: string;
  senderName: string;
}) {
  if (message.type === "SYSTEM" && message.content.startsWith("__CALL__")) {
    const ended = message.content === "__CALL__ended";
    return (
      <div className="flex justify-center my-2">
        <div className="flex items-center gap-2 rounded-full bg-stone-100 px-4 py-2 text-xs text-stone-500">
          {ended ? (
            <VideoOff className="h-3.5 w-3.5 text-red-400" />
          ) : (
            <Video className="h-3.5 w-3.5 text-brand-500" />
          )}
          {ended ? "Call ended" : "Video call started"} · {formatTime(message.createdAt)}
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
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const { id: conversationId } = useParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  const [conversation, setConversation] = useState<ConversationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [inCall, setInCall] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadConversation = useCallback(async () => {
    const res = await apiFetch(`/api/messages/${conversationId}`);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? "Couldn't load this conversation.");
    }
    setConversation(await res.json());
  }, [conversationId]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    (async () => {
      try {
        await loadConversation();
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Couldn't load this conversation.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    const interval = setInterval(() => {
      loadConversation().catch(() => {});
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [token, loadConversation]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages.length]);

  async function postMessage(content: string, type?: "TEXT" | "SYSTEM") {
    const res = await apiFetch(`/api/messages/${conversationId}`, {
      method: "POST",
      body: JSON.stringify({ content, type }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? "Couldn't send that message.");
    }
    await loadConversation();
  }

  async function sendMessage(content: string) {
    if (!content.trim() || sending) return;
    setSending(true);
    setInput("");
    try {
      await postMessage(content.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send that message.");
    } finally {
      setSending(false);
    }
  }

  async function startCall() {
    setInCall(true);
    try {
      await postMessage("__CALL__started", "SYSTEM");
    } catch {
      // Non-fatal — the call itself still starts even if the system message fails to log.
    }
  }

  async function endCall() {
    setInCall(false);
    try {
      await postMessage("__CALL__ended", "SYSTEM");
    } catch {
      // Non-fatal — see startCall.
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  if (!token || !user) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
        <p className="text-stone-500">Sign in to view this conversation.</p>
        <Link href="/login" className="btn-primary">Sign in</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-stone-400">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (error && !conversation) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
        <p className="text-stone-500">{error}</p>
        <Link href="/chat" className="btn-secondary">Back to messages</Link>
      </div>
    );
  }

  if (!conversation) return null;

  const other =
    conversation.match.seekerId === user.id ? conversation.match.mentor : conversation.match.seeker;
  const otherAvatar = avatarOrFallback(other);
  const roomName = `myalongside-${conversation.id}`;

  return (
    <>
      {inCall && (
        <VideoCallOverlay
          roomName={roomName}
          participantName={other.name}
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
              src={otherAvatar}
              alt={other.name}
              width={40}
              height={40}
              className="rounded-full bg-stone-100"
              unoptimized
            />
            {other.mentorProfile?.isAvailable && (
              <span className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-stone-900 text-sm leading-tight">{other.name}</p>
            {other.mentorProfile && (
              <p className="text-xs text-stone-400">
                {other.mentorProfile.isAvailable ? "Online" : "Offline"}
              </p>
            )}
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
          {error && (
            <p className="text-center text-xs text-red-500">{error}</p>
          )}
          {conversation.messages.length === 0 && (
            <p className="text-center text-sm text-stone-400 mt-8">
              Say hello to start the conversation.
            </p>
          )}
          {conversation.messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isMine={msg.sender.id === user.id}
              senderAvatar={otherAvatar}
              senderName={other.name}
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
              placeholder={`Message ${other.name}…`}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending}
            />

            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || sending}
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
