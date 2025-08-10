"use client";

import { usePathname } from "next/navigation";
import SideBar from "./components/sidebar";

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login";

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="grid h-dvh md:grid-cols-[256px_1fr] grid-cols-1">
      <SideBar />
      <main className="overflow-auto p-4 md:p-6">{children}</main>
    </div>
  );
}
