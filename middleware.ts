import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "./auth.config";

const PROTECTED_PREFIX = "/admin";
const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

// Rutas de API cuya escritura debe estar reservada a la administradora.
// (Los GET quedan públicos porque también los usa la tienda.)
const PROTECTED_API_PREFIXES = ["/api/categories", "/api/materials", "/api/products"];

// Rutas de API exclusivas del panel: acá no hay uso público ni siquiera
// para leer (a diferencia de las de arriba), así que se protegen todos
// los métodos, no solo los que escriben.
const ADMIN_ONLY_API_PREFIXES = ["/api/admin"];

// Instancia "edge-safe" de NextAuth: solo decodifica el JWT de la cookie de
// sesión, no usa el provider de Credentials (que necesita Node.js).
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Proteger todas las páginas del panel de administración.
  if (pathname.startsWith(PROTECTED_PREFIX)) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Si ya inició sesión, no tiene sentido que vea el formulario de login.
  if (pathname === "/login" && isLoggedIn) {
    return NextResponse.redirect(new URL("/admin", req.nextUrl.origin));
  }

  // Proteger las mutaciones de la API (crear/editar/borrar productos, etc).
  const isProtectedApi = PROTECTED_API_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
  if (isProtectedApi && MUTATING_METHODS.has(req.method) && !isLoggedIn) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  // Rutas 100% exclusivas del panel: se bloquea cualquier método sin sesión.
  const isAdminOnlyApi = ADMIN_ONLY_API_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
  if (isAdminOnlyApi && !isLoggedIn) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/login",
    "/api/categories/:path*",
    "/api/materials/:path*",
    "/api/products/:path*",
    "/api/admin/:path*",
  ],
};
