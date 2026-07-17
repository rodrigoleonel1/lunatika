import { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión | Lunatika",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-6">
      <div className="w-full max-w-sm space-y-6 bg-white p-8 rounded-lg shadow-md border">
        <div className="text-center space-y-1">
          <p className="font-bold text-2xl tracking-tighter">lunatika.ac</p>
          <h1 className="text-xl font-semibold">Panel de administración</h1>
          <p className="text-sm text-muted-foreground">
            Ingresá con tu cuenta de administradora.
          </p>
        </div>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
