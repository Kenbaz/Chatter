"use client";

import { useEffect} from "react";
import { useAuthentication } from "./AuthContext"; // Update this path
import { useRouter } from "next/navigation";

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, initialLoading, } = useAuthentication();
  const router = useRouter();


  useEffect(() => {
    if (!initialLoading && !user) {
      // Redirect unauthenticated users to the login page
      router.push("/");
    }
  }, [user, initialLoading, router]);

  if (initialLoading) {
    return "";
  }

  return <>{children}</>;
}
