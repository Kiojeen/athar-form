import { useEffect } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";

export const PORTAL_ID_KEY = "athar_portal_id";

export function usePortalLink() {
  const user = useQuery(api.users.getCurrentUser);
  const linkToUniversity = useMutation(api.universities.linkUserToUniversity);

  useEffect(() => {
    if (!user) return;
    if (user.isAdmin) {
      localStorage.removeItem(PORTAL_ID_KEY);
      return;
    }
    if (user.universityId) {
      localStorage.removeItem(PORTAL_ID_KEY);
      return;
    }

    const portalId = localStorage.getItem(PORTAL_ID_KEY);
    if (!portalId) return;

    linkToUniversity({ universityId: portalId as Id<"universities"> })
      .then(() => localStorage.removeItem(PORTAL_ID_KEY))
      .catch(console.error);
  }, [user]);
}
