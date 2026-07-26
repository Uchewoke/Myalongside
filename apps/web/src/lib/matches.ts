export interface Participant {
  id: string;
  name: string;
  avatar: string | null;
}

export interface LastMessage {
  content: string;
  type: "TEXT" | "SYSTEM";
  createdAt: string;
  senderId: string;
}

/** Shape returned by GET /api/matches (see listMyMatches in the backend). */
export interface MatchListItem {
  id: string;
  seeker: Participant;
  mentor: Participant;
  lifeEvent: { slug: string; label: string; emoji: string } | null;
  conversation: {
    id: string;
    updatedAt: string;
    messages: LastMessage[];
    _count: { messages: number };
  } | null;
}

/** The other participant relative to `userId` — the mentor if I'm the seeker, and vice versa. */
export function otherParticipant(match: MatchListItem, userId: string): Participant {
  return match.seeker.id === userId ? match.mentor : match.seeker;
}

export function previewText(message: LastMessage | undefined): string {
  if (!message) return "Say hello to start the conversation.";
  if (message.type === "SYSTEM" && message.content === "__CALL__started") return "📹 Video call started";
  if (message.type === "SYSTEM" && message.content === "__CALL__ended") return "📹 Video call ended";
  return message.content;
}

export function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
