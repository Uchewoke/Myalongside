import { Suspense } from "react";
import PaywallPage from "./PaywallPage";

export default function DashboardPaywallPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center">Loading...</div>}>
      <PaywallPage />
    </Suspense>
  );
}
