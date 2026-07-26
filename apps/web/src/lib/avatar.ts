export function avatarOrFallback(entity: { id: string; avatar: string | null }): string {
  return (
    entity.avatar ??
    `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(entity.id)}`
  );
}
