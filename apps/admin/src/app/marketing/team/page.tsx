import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { MarketingTeam } from "@/components/MarketingTeam";

export const metadata = {
  title: "AI Marketing Team | MyAlongside Admin",
};

export default async function MarketingTeamPage() {
  const session = await getAdminSession();
  if (!session) redirect("/login");

  return <MarketingTeam />;
}
