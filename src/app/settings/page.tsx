import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import SettingsClient from "./SettingsClient";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const session = await auth();
  if (!session) redirect("/signin");

  return (
    <Suspense>
      <SettingsClient />
    </Suspense>
  );
}
