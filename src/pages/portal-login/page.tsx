/**
 * Route: /login/:portalId
 * Students land here via the portal link.
 * We stash the portalId in localStorage, then trigger Google sign-in.
 * After redirect back, App.tsx reads it and calls linkUserToUniversity.
 */
import { useEffect } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Google } from "@/components/ui/svgs/google";

export const PORTAL_ID_KEY = "athar_portal_id";

export default function PortalLoginPage() {
  const { portalId } = useParams<{ portalId: string }>();
  const { signIn } = useAuthActions();

  const university = useQuery(
    api.universities.getUniversity,
    portalId ? { id: portalId as Id<"universities"> } : "skip",
  );

  // Stash the portalId before OAuth redirect
  useEffect(() => {
    if (portalId) localStorage.setItem(PORTAL_ID_KEY, portalId);
  }, [portalId]);

  const handleSignIn = async () => {
    await signIn("google", { redirectTo: "/" });
  };

  // Loading
  if (university === undefined) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (university === null) {
    return (
      <div
        dir="rtl"
        className="bg-background flex min-h-screen items-center justify-center px-4"
      >
        <div className="space-y-2 text-center">
          <p className="text-lg font-semibold">الرابط غير صالح</p>
          <p className="text-muted-foreground text-sm">
            هذه البوابة غير موجودة أو انتهت صلاحيتها
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="bg-background flex min-h-screen items-center justify-center px-4"
    >
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="bg-primary/5 absolute top-1/3 left-1/2 h-150 w-150 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm space-y-6">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex justify-center">
            <div className="bg-secondary p-6">
              <img
                src="/brand-logo.png"
                alt="أثر"
                width={120}
                height={120}
                className="pointer-events-none object-contain select-none"
                draggable={false}
              />
            </div>
          </div>

          <h1 className="font-hend text-center text-2xl font-semibold tracking-tight">
            أزياء تترك أثر لاينسى
          </h1>
        </div>

        <div className="space-y-1.5 text-center">
          <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
            بوابة
          </p>
          <h1 className="font-amiri text-2xl font-bold tracking-tight">
            {university.name}
          </h1>
          <p className="text-muted-foreground text-sm">
            سجّل دخولك للمتابعة وتقديم طلبك
          </p>
        </div>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium">
              تسجيل الدخول
            </CardTitle>
            <CardDescription className="text-xs">
              استخدم حساب Google الخاص بك للبدء
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="h-10 w-full gap-3 font-medium"
              onClick={handleSignIn}
            >
              <Google />
              المتابعة مع Google
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
