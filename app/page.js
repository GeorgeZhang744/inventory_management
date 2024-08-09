"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function App() {
  const router = useRouter();
  
  // Redirect to the login page
  useEffect(() => {
    router.push("/auth/login");
  }, [router]);

  return <></>;
}
