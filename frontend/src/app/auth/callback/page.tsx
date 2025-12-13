"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const CallbackPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (error) {
      // Redirect to login page with error
      router.push(`/login?error=${error}`);
      return;
    }

    if (status === "authenticated" && session) {
      const user = session.user;
      if (user) {
        const isAdmin = user.role === "ADMIN";
        if (isAdmin) {
          router.push("/admin");
        } else {
          router.push("/");
        }
      }
    } else if (status === "unauthenticated") {
        // Redirect to login if not authenticated
        router.push("/login");
    }
  }, [status, session, router, error]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-dashed border-primary"></div>
        <p className="text-lg font-semibold text-gray-700">
          Đang xác thực, vui lòng chờ...
        </p>
      </div>
    </div>
  );
};

export default CallbackPage;