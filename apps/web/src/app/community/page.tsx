"use client";

import Image from "next/image";
import { useState } from "react";
import {
  Heart,
  MessageSquare,
  Share2,
  BookOpen,
  TrendingUp,
  Users,
  Plus,
  X,
  ChevronDown,
  Lock,
  Globe,
  CheckCircle,
} from "lucide-react";
import { LIFE_EVENTS } from "@/lib/constants";
import { MOCK_CURRENT_USER } from "@/lib/mock-data";
import { useAuthStore } from "@/store/useAuthStore";
import { getPublicProfile } from "@/lib/public-profile";
import { clsx } from "clsx";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Post {
  id: string;
  author: { name: string; avatar: string; role: "SEEKER" | "MENTOR" };
  lifeEvent: string;
  title: string;
  body: string;
  likes: number;
  comments: number;
  timeAgo: string;
  communityId?: string;
}

interface Community {
  id: string;
  name: string;
  description: string;
  lifeEvent: string;
  privacy: "public" | "private";
  memberCount: number;
  postCount: number;
  createdBy: string;
  createdByRole: "SEEKER" | "MENTOR";
  joined: boolean;
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const INITIAL_POSTS: Post[] = [
  {
    id: "p1",
    author: {
      name: "Anonymous Seeker",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=anon1&backgroundColor=b6e3f4",
      role: "SEEKER",
    },
    lifeEvent: "divorce",
    title: "6 months out — what helped me most",
    body: "After my divorce was finalised, I thought I'd never feel whole again. These are the three things that actually helped me move forward: journaling without judgment, finding this community, and allowing myself to grieve properly.",
    likes: 47,
    comments: 12,
    timeAgo: "2h ago",
  },
  {
    id: "p2",
    author: {
      name: "Marcus W.",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=MarcusW&backgroundColor=c0aede",
      role: "MENTOR",
    },
    lifeEvent: "job-loss",
    title: "The reframe that changed everything for me",
    body: "When I was made redundant, I kept asking 'why me?' It wasn't until I started asking 'what now?' that things began to shift. The question you ask yourself matters more than you'd think.",
    likes: 89,
    comments: 31,
    timeAgo: "5h ago",
  },
  {
    id: "p3",
    author: {
      name: "Anonymous Seeker",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=anon2&backgroundColor=d1f2a5",
      role: "SEEKER",
    },
    lifeEvent: "mental-health",
    title: "Finally asked for help today",
    body: "I know this might seem small but I finally reached out to a mentor after weeks of lurking here. Just wanted to share in case anyone else is on the fence — it's absolutely worth it.",
    likes: 134,
    comments: 28,
    timeAgo: "Yesterday",
  },
];

const INITIAL_COMMUNITIES: Community[] = [
  {
    id: "c1",
    name: "Divorce & New Beginnings",
    description: "A safe space for those navigating separation, divorce, and rebuilding life on the other side.",
    lifeEvent: "divorce",
    privacy: "public",
    memberCount: 312,
    postCount: 89,
    createdBy: "Sarah C.",
    createdByRole: "MENTOR",
    joined: true,
  },
  {
    id: "c2",
    name: "Career Comeback",
    description: "For anyone who's been made redundant, resigned, or pivoting — and is figuring out what's next.",
    lifeEvent: "job-loss",
    privacy: "public",
    memberCount: 487,
    postCount: 203,
    createdBy: "Marcus W.",
    createdByRole: "MENTOR",
    joined: false,
  },
  {
    id: "c3",
    name: "Grief Circle",
    description: "Holding space for those carrying loss. No timeline, no pressure — just understanding.",
    lifeEvent: "grief",
    privacy: "private",
    memberCount: 154,
    postCount: 61,
    createdBy: "Anonymous Seeker",
    createdByRole: "SEEKER",
    joined: false,
  },
  {
    id: "c4",
    name: "Mental Wellness Corner",
    description: "Honest conversations about anxiety, depression, burnout, and finding your way back to yourself.",
    lifeEvent: "mental-health",
    privacy: "public",
    memberCount: 628,
    postCount: 341,
    createdBy: "Dr. Priya N.",
    createdByRole: "MENTOR",
    joined: true,
  },
];

// ─── Create Post Modal ─────────────────────────────────────────────────────────

function CreatePostModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (title: string, body: string, lifeEvent: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [lifeEvent, setLifeEvent] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return setError("Please add a title.");
    if (!body.trim()) return setError("Please write something.");
    if (!lifeEvent) return setError("Please select a life experience.");
    onSubmit(title.trim(), body.trim(), lifeEvent);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
          <h2 className="font-bold text-stone-900">Share with the Community</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-700">
              Life experience <span className="text-brand-600">*</span>
            </label>
            <div className="relative">
              <select value={lifeEvent} onChange={(e) => { setLifeEvent(e.target.value); setError(""); }} className="input-field appearance-none pr-9">
                <option value="">Select a topic…</option>
                {LIFE_EVENTS.map((e) => <option key={e.id} value={e.id}>{e.emoji} {e.label}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-700">
              Title <span className="text-brand-600">*</span>
            </label>
            <input type="text" placeholder="Give your post a clear title…" className="input-field" maxLength={120} value={title} onChange={(e) => { setTitle(e.target.value); setError(""); }} />
            <p className="mt-1 text-right text-xs text-stone-400">{title.length}/120</p>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-700">
              Your story or insight <span className="text-brand-600">*</span>
            </label>
            <textarea placeholder="Share what's on your mind. This is a safe, supportive space…" className="input-field min-h-[120px] resize-none" maxLength={1000} value={body} onChange={(e) => { setBody(e.target.value); setError(""); }} />
            <p className="mt-1 text-right text-xs text-stone-400">{body.length}/1000</p>
          </div>
          {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
            <button type="submit" className="btn-primary">Post to Community</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Create Community Modal ────────────────────────────────────────────────────

function CreateCommunityModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: { name: string; description: string; lifeEvent: string; privacy: "public" | "private" }) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [lifeEvent, setLifeEvent] = useState("");
  const [privacy, setPrivacy] = useState<"public" | "private">("public");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("Please give your community a name.");
    if (!description.trim()) return setError("Please add a description.");
    if (!lifeEvent) return setError("Please choose a primary topic.");
    onSubmit({ name: name.trim(), description: description.trim(), lifeEvent, privacy });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
          <div>
            <h2 className="font-bold text-stone-900">Create a Community</h2>
            <p className="mt-0.5 text-xs text-stone-500">Build a space around a shared experience</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-700">
              Community name <span className="text-brand-600">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Starting Over at 40"
              className="input-field"
              maxLength={60}
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
            />
            <p className="mt-1 text-right text-xs text-stone-400">{name.length}/60</p>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-700">
              Description <span className="text-brand-600">*</span>
            </label>
            <textarea
              placeholder="What is this community about? Who is it for?"
              className="input-field min-h-[90px] resize-none"
              maxLength={300}
              value={description}
              onChange={(e) => { setDescription(e.target.value); setError(""); }}
            />
            <p className="mt-1 text-right text-xs text-stone-400">{description.length}/300</p>
          </div>

          {/* Primary topic */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-700">
              Primary topic <span className="text-brand-600">*</span>
            </label>
            <div className="relative">
              <select value={lifeEvent} onChange={(e) => { setLifeEvent(e.target.value); setError(""); }} className="input-field appearance-none pr-9">
                <option value="">Choose the main life experience…</option>
                {LIFE_EVENTS.map((e) => <option key={e.id} value={e.id}>{e.emoji} {e.label}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            </div>
          </div>

          {/* Privacy */}
          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700">Privacy</label>
            <div className="grid grid-cols-2 gap-3">
              {(["public", "private"] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setPrivacy(opt)}
                  className={clsx(
                    "flex items-start gap-3 rounded-xl border-2 p-3.5 text-left transition-all",
                    privacy === opt
                      ? "border-brand-500 bg-brand-50"
                      : "border-stone-200 hover:border-stone-300"
                  )}
                >
                  <div className={clsx("mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors", privacy === opt ? "border-brand-500 bg-brand-500" : "border-stone-300")}>
                    {privacy === opt && <CheckCircle className="h-3 w-3 text-white" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      {opt === "public" ? <Globe className="h-3.5 w-3.5 text-stone-500" /> : <Lock className="h-3.5 w-3.5 text-stone-500" />}
                      <span className="text-sm font-semibold text-stone-800 capitalize">{opt}</span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-stone-500">
                      {opt === "public" ? "Anyone can find and join" : "Members join by request only"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>}

          <div className="flex items-center justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
            <button type="submit" className="btn-primary">Create Community</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Community Card ────────────────────────────────────────────────────────────

function CommunityCard({
  community,
  onToggleJoin,
}: {
  community: Community;
  onToggleJoin: (id: string) => void;
}) {
  const event = LIFE_EVENTS.find((e) => e.id === community.lifeEvent);

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        {/* Icon */}
        <div className={clsx("flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-2xl", event ? `bg-gradient-to-br ${event.bgGradient} shadow-sm` : "bg-stone-100")}>
          {event?.emoji ?? "🌐"}
        </div>

        {/* Join / Leave */}
        <button
          onClick={() => onToggleJoin(community.id)}
          className={clsx(
            "flex-shrink-0 rounded-xl px-4 py-1.5 text-sm font-semibold transition-all",
            community.joined
              ? "border border-stone-200 bg-white text-stone-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              : "bg-brand-600 text-white hover:bg-brand-700"
          )}
        >
          {community.joined ? "Joined" : "Join"}
        </button>
      </div>

      <div className="mt-3">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-bold text-stone-900">{community.name}</h3>
          {community.privacy === "private" && (
            <span className="flex items-center gap-1 rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-500">
              <Lock className="h-2.5 w-2.5" /> Private
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-stone-500 leading-relaxed">{community.description}</p>

        {event && (
          <span className={clsx("mt-2.5 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium border", event.color)}>
            {event.emoji} {event.label}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center gap-4 border-t border-stone-100 pt-3 text-xs text-stone-400">
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          {community.memberCount.toLocaleString()} members
        </span>
        <span className="flex items-center gap-1">
          <BookOpen className="h-3.5 w-3.5" />
          {community.postCount} posts
        </span>
        <span className="ml-auto">
          by {community.createdBy} ·{" "}
          <span className={clsx("font-medium", community.createdByRole === "MENTOR" ? "text-brand-600" : "text-stone-500")}>
            {community.createdByRole === "MENTOR" ? "Mentor" : "Seeker"}
          </span>
        </span>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

type Tab = "feed" | "communities";

export default function CommunityPage() {
  const authUser = useAuthStore((state) => state.user);
  const user = authUser ?? MOCK_CURRENT_USER;
  const publicUser = getPublicProfile(user);

  const [tab, setTab] = useState<Tab>("feed");
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [communities, setCommunities] = useState<Community[]>(INITIAL_COMMUNITIES);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<"post" | "community" | null>(null);

  function toggleLike(id: string) {
    setLiked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleJoin(id: string) {
    setCommunities((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, joined: !c.joined, memberCount: c.memberCount + (c.joined ? -1 : 1) }
          : c
      )
    );
  }

  function handleCreatePost(title: string, body: string, lifeEvent: string) {
    setPosts((prev) => [
      {
        id: `p-${Date.now()}`,
        author: { name: publicUser.displayName, avatar: publicUser.avatar, role: user.role },
        lifeEvent,
        title,
        body,
        likes: 0,
        comments: 0,
        timeAgo: "Just now",
      },
      ...prev,
    ]);
    setModal(null);
  }

  function handleCreateCommunity(data: { name: string; description: string; lifeEvent: string; privacy: "public" | "private" }) {
    setCommunities((prev) => [
      {
        id: `com-${Date.now()}`,
        name: data.name,
        description: data.description,
        lifeEvent: data.lifeEvent,
        privacy: data.privacy,
        memberCount: 1,
        postCount: 0,
        createdBy: publicUser.displayName,
        createdByRole: user.role,
        joined: true,
      },
      ...prev,
    ]);
    setModal(null);
    setTab("communities");
  }

  const joinedCount = communities.filter((c) => c.joined).length;

  return (
    <>
      {modal === "post" && <CreatePostModal onClose={() => setModal(null)} onSubmit={handleCreatePost} />}
      {modal === "community" && <CreateCommunityModal onClose={() => setModal(null)} onSubmit={handleCreateCommunity} />}

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Community</h1>
            <p className="mt-1 text-stone-500">Stories, insights, and support from people who understand.</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => setModal("post")} className="btn-secondary !px-3 !py-2 !text-sm">
              <Plus className="h-4 w-4" /> New Post
            </button>
            <button onClick={() => setModal("community")} className="btn-primary !px-3 !py-2 !text-sm">
              <Plus className="h-4 w-4" /> Create Community
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Members", value: "2.4k", icon: Users, color: "text-brand-600 bg-brand-50" },
            { label: "Communities", value: communities.length, icon: BookOpen, color: "text-emerald-600 bg-emerald-50" },
            { label: "Active today", value: "143", icon: TrendingUp, color: "text-amber-600 bg-amber-50" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card p-4 flex items-center gap-3">
              <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="font-bold text-stone-900 text-lg leading-tight">{value}</p>
                <p className="text-xs text-stone-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-xl border border-stone-200 bg-stone-100 p-1">
          {([["feed", "Feed"], ["communities", `Communities${joinedCount ? ` · ${joinedCount} joined` : ""}`]] as [Tab, string][]).map(
            ([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={clsx(
                  "flex-1 rounded-lg py-2 text-sm font-medium transition-all",
                  tab === key
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-500 hover:text-stone-700"
                )}
              >
                {label}
              </button>
            )
          )}
        </div>

        {/* Feed tab */}
        {tab === "feed" && (
          <div className="space-y-4">
            {posts.map((post) => {
              const event = LIFE_EVENTS.find((e) => e.id === post.lifeEvent);
              const isLiked = liked.has(post.id);
              return (
                <article key={post.id} className="card p-6">
                  <div className="flex items-start gap-3">
                    <Image src={post.author.avatar} alt={post.author.name} width={40} height={40} className="rounded-full bg-stone-100 flex-shrink-0" unoptimized />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-stone-900">{post.author.name}</span>
                        <span className={clsx("rounded-full px-2 py-0.5 text-[10px] font-medium", post.author.role === "MENTOR" ? "bg-brand-100 text-brand-700" : "bg-stone-100 text-stone-600")}>
                          {post.author.role === "MENTOR" ? "Mentor" : "Seeker"}
                        </span>
                        {event && (
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium border ${event.color}`}>
                            {event.emoji} {event.label}
                          </span>
                        )}
                        <span className="ml-auto text-xs text-stone-400">{post.timeAgo}</span>
                      </div>
                      <h3 className="mt-2 font-semibold text-stone-900">{post.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-stone-600">{post.body}</p>
                      <div className="mt-4 flex items-center gap-5">
                        <button onClick={() => toggleLike(post.id)} className={clsx("flex items-center gap-1.5 text-sm transition-colors", isLiked ? "text-brand-600" : "text-stone-400 hover:text-brand-600")}>
                          <Heart className="h-4 w-4" fill={isLiked ? "currentColor" : "none"} />
                          {post.likes + (isLiked ? 1 : 0)}
                        </button>
                        <button className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-600 transition-colors">
                          <MessageSquare className="h-4 w-4" />
                          {post.comments}
                        </button>
                        <button className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-600 transition-colors">
                          <Share2 className="h-4 w-4" />
                          Share
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Communities tab */}
        {tab === "communities" && (
          <div className="space-y-4">
            {communities.length === 0 ? (
              <div className="card p-12 text-center">
                <Users className="mx-auto h-10 w-10 text-stone-300 mb-3" />
                <p className="font-medium text-stone-600">No communities yet</p>
                <p className="mt-1 text-sm text-stone-400">Be the first to create one.</p>
                <button onClick={() => setModal("community")} className="btn-primary mt-4 inline-flex">
                  <Plus className="h-4 w-4" /> Create Community
                </button>
              </div>
            ) : (
              communities.map((community) => (
                <CommunityCard key={community.id} community={community} onToggleJoin={toggleJoin} />
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
}
