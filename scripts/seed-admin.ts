/**
 * Script para crear (o actualizar la contraseña de) la usuaria administradora.
 *
 * Uso:
 *   npm run seed:admin -- --username=admin --password=unaClaveSegura --name="Administradora" --email=admin@lunatika.ac
 *
 * También podés definir ADMIN_USERNAME / ADMIN_PASSWORD / ADMIN_NAME / ADMIN_EMAIL
 * en tu .env y correr simplemente: npm run seed:admin
 *
 * El login de /admin pide usuario y contraseña (no email) — el email queda
 * solo como dato de contacto, no se usa para iniciar sesión.
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import Admin from "../lib/models/Admin";

function getArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const found = process.argv.find((arg) => arg.startsWith(prefix));
  return found?.slice(prefix.length);
}

async function main() {
  const username = getArg("username") || process.env.ADMIN_USERNAME;
  const password = getArg("password") || process.env.ADMIN_PASSWORD;
  const name = getArg("name") || process.env.ADMIN_NAME || "Administradora";
  const email = getArg("email") || process.env.ADMIN_EMAIL || "";

  if (!username || !password) {
    console.error(
      "Faltan datos. Pasá --username y --password, o definí ADMIN_USERNAME / ADMIN_PASSWORD en tu .env"
    );
    process.exit(1);
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("Falta la variable de entorno MONGODB_URI en tu .env");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await Admin.findOneAndUpdate(
    { username: username.toLowerCase() },
    { username: username.toLowerCase(), password: hashedPassword, name, email: email.toLowerCase() },
    { upsert: true, new: true }
  );

  console.log(`✅ Administradora lista: ${admin.username}`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
