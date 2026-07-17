import { Metadata } from "next";
import { AdminNavbar } from "@/components/admin/navbar";
import { AdminSessionProvider } from "@/components/admin/session-provider";

export const metadata: Metadata = {
  title: "Panel de administración | Lunatika",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AdminSessionProvider>
      <AdminNavbar />
      {children}
    </AdminSessionProvider>
  );
}
