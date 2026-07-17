import type { NextAuthConfig } from "next-auth";

/**
 * Configuración "edge-safe": sin providers que dependan de bcrypt o de
 * mongoose (esos requieren el runtime de Node.js). Este archivo es el único
 * que puede importar el middleware, que corre en el Edge Runtime de Next.js.
 * La configuración completa (con el provider de Credentials) vive en auth.ts.
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = "admin";
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
};
