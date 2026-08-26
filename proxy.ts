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

// Rate limiting simple en memoria (free tier, sin KV). Ventana 60s, 60 req/min/IP
// solo para GET /api/* y /sitemap.xml. Suficiente para portfolio, no es distribuido.
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 60;
const BOT_ALLOWLIST = /googlebot|bingbot/i;

declare global {
  var _rateLimitStore: Map<string, { count: number; reset: number }> | undefined;
}

function getRateLimitStore(): Map<string, { count: number; reset: number }> {
  if (!globalThis._rateLimitStore) {
    globalThis._rateLimitStore = new Map();
  }
  return globalThis._rateLimitStore;
}

// Instancia "liviana" de NextAuth: solo decodifica el JWT de la cookie de
// sesión, no usa el provider de Credentials (que necesita MongoDB).
const { auth } = NextAuth(authConfig);

// Next.js 16: el archivo `proxy.ts` (antes `middleware.ts`) corre en el
// runtime de Node.js y el export se llama `proxy`.
export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Rate limiting solo para GET /api/* y /sitemap.xml (free tier)
  const isRateLimitedPath =
    (pathname.startsWith("/api/") || pathname === "/sitemap.xml") && req.method === "GET";

  if (isRateLimitedPath) {
    const userAgent = req.headers.get("user-agent") ?? "";
    if (!BOT_ALLOWLIST.test(userAgent)) {
      const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip") ||
        "unknown";
      const key = `${ip}:${pathname.startsWith("/api/") ? "/api" : pathname}`;
      const store = getRateLimitStore();
      const now = Date.now();
      const entry = store.get(key);

      if (!entry || entry.reset < now) {
        store.set(key, { count: 1, reset: now + RATE_LIMIT_WINDOW });
      } else {
        entry.count += 1;
        if (entry.count > RATE_LIMIT_MAX) {
          return NextResponse.json(
            { message: "Too Many Requests" },
            { status: 429, headers: { "Retry-After": "60" } }
          );
        }
      }

      // Limpieza periódica de entradas expiradas (probabilidad 10%)
      if (Math.random() < 0.1) {
        for (const [k, v] of store.entries()) {
          if (v.reset < now) store.delete(k);
        }
      }
    }
  }

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
    "/api/:path*",
    "/sitemap.xml",
    "/robots.txt",
  ],
};