import { z } from "zod";

export const productSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(255, "El nombre no debe exceder los 255 caracteres"),
  price: z.coerce.number().min(1, "El precio debe ser un número positivo"),
  stock: z.coerce
    .number()
    .min(0, "El stock debe ser un número entero positivo o cero"),
  isFeatured: z.boolean().optional().default(false),
  isArchived: z.boolean().optional().default(false),
  images: z
    .array(z.string().url("Cada imagen debe ser una URL válida"))
    .optional(),
  category_id: z.string().min(1, "Debe seleccionar una categoría"),
  material_id: z.string().min(1, "Debe seleccionar un material"),
});

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(255, "El nombre no debe exceder los 255 caracteres"),
  billboard: z.string(),
});

export const materialSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(255, "El nombre no debe exceder los 255 caracteres"),
});

export const loginSchema = z.object({
  username: z.string().min(1, "El usuario es obligatorio"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});
