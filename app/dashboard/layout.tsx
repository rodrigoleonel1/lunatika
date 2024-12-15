import Navbar from "@/components/navbar";

interface LayoutDashboardParams {
  children: React.ReactNode;
}

export default function LayoutDashboard({ children }: LayoutDashboardParams) {
  return (
    <>
      <Navbar/>
      {children}
    </>
  );
}
