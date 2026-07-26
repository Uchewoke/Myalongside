import { apiFetch } from "@/lib/api-client";

/**
 * Creates a match with a mentor (or finds the existing one) and returns its
 * conversation id. Used by anything with a "Connect"/"Message" action.
 */
export async function connectWithMentor(mentorId: string, lifeEventSlug?: string): Promise<string> {
  const res = await apiFetch("/api/matches", {
    method: "POST",
    body: JSON.stringify({ mentorId, lifeEventSlug }),
  });

  // 201 = newly created match, 409 = match already exists — both carry the
  // match (with its conversation) in the response body.
  if (!res.ok && res.status !== 409) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Couldn't start this conversation.");
  }

  const body = await res.json();
  const match = res.status === 409 ? body.match : body;
  if (!match?.conversation?.id) {
    throw new Error("Couldn't start this conversation.");
  }

  return match.conversation.id as string;
}
