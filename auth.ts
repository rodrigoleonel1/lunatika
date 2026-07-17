import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/lib/models/Admin";
import { loginSchema } from "@/lib/zod";
import { authConfig } from "./auth.config";

/**
 * Configuración completa de NextAuth, incluye el provider de Credentials
 * (que usa bcrypt y mongoose). Se usa en los Route Handlers y en Server
 * Components/Actions — NUNCA se importa desde middleware.ts.
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { username, password } = parsed.data;

        await connectDB();
        const admin = await Admin.findOne({ username: username.toLowerCase() });
        if (!admin) return null;

        const isValid = await bcrypt.compare(password, admin.password);
        if (!isValid) return null;

        return {
          id: admin._id.toString(),
          email: admin.email,
          name: admin.name,
        };
      },
    }),
  ],
});
