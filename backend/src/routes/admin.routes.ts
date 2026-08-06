import { createSecureRouter, Permission } from "../middleware/permissions.middleware";
import { requireStepUp } from "../middleware/stepup.middleware";
import {
  requestRoleChange,
  listRoleChangeRequests,
  approveRoleChange,
  rejectRoleChange,
} from "../controllers/role-change.controller";
import {
  startImpersonation,
  endImpersonation,
  listActiveImpersonations,
} from "../controllers/impersonation.controller";

const router = createSecureRouter();

// ── Dual-control role changes ────────────────────────────────────────────────
router.post("/role-changes", Permission.admin(), requestRoleChange);
router.get("/role-changes", Permission.admin(), listRoleChangeRequests);
router.post("/role-changes/:id/approve", Permission.admin(requireStepUp()), approveRoleChange);
router.post("/role-changes/:id/reject", Permission.admin(), rejectRoleChange);

// ── Impersonation ("log in as user") ─────────────────────────────────────────
router.post("/impersonation", Permission.admin(requireStepUp()), startImpersonation);
router.post("/impersonation/:id/end", Permission.admin(), endImpersonation);
router.get("/impersonation", Permission.admin(), listActiveImpersonations);

export default router;
