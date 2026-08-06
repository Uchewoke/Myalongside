import OAuthCallbackClient from "./OAuthCallbackClient";

export default async function OAuthCallbackPage({
  searchParams,
}: {
  searchParams?: Promise<{ code?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  return <OAuthCallbackClient code={resolvedSearchParams?.code ?? null} />;
}
