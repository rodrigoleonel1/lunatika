import "server-only";
import type { Category as CategoryType, Material as MaterialType, Product as ProductType } from "@/lib/types";

/**
 * Forma mínima de un documento de Mongoose (hidratado o `.lean()`) que
 * necesitamos para serializar: sabemos que trae `_id`, el resto de los
 * campos los tipamos como `unknown` y los casteamos puntualmente al
 * armar cada respuesta, en vez de tipar todo el documento como `any`.
 */
interface LeanDoc extends Record<string, unknown> {
  _id: { toString(): string };
}

/**
 * Convierte un documento (o lean object) de Mongoose en un objeto plano
 * serializable, con "id" en vez de "_id". Recibe `unknown` a propósito:
 * a veces es un Document hidratado (con métodos de Mongoose) y a veces un
 * objeto plano de `.lean()`, dos formas incompatibles entre sí a nivel de
 * tipos aunque representen los mismos datos — así que casteamos adentro
 * en vez de pelear con la forma exacta de cada uno.
 */
export function serializeCategory(input: unknown): CategoryType {
  const doc = input as LeanDoc;
  return {
    id: doc._id.toString(),
    name: doc.name as string,
    billboard: doc.billboard as string,
    createdAt: doc.createdAt as Date,
  };
}

export function serializeMaterial(input: unknown): MaterialType {
  const doc = input as LeanDoc;
  return {
    id: doc._id.toString(),
    name: doc.name as string,
  };
}

/**
 * Serializa un producto ya populado (category_id y material_id populados
 * con sus documentos), reproduciendo la forma que usaba la API anterior:
 * mantiene category_id/material_id como strings y agrega category/material
 * con el nombre.
 */
export function serializeProduct(input: unknown): ProductType {
  const doc = input as LeanDoc;
  const category = doc.category_id as LeanDoc | { toString(): string };
  const material = doc.material_id as LeanDoc | { toString(): string };

  const isCategoryPopulated = category && typeof category === "object" && "name" in category;
  const isMaterialPopulated = material && typeof material === "object" && "name" in material;

  return {
    id: doc._id.toString(),
    name: doc.name as string,
    price: doc.price as number,
    stock: doc.stock as number,
    isFeatured: doc.isFeatured as boolean,
    isArchived: doc.isArchived as boolean,
    images: (doc.images as string[]) ?? [],
    category_id: isCategoryPopulated
      ? (category as LeanDoc)._id.toString()
      : category?.toString(),
    material_id: isMaterialPopulated
      ? (material as LeanDoc)._id.toString()
      : material?.toString(),
    category: {
      name: isCategoryPopulated ? ((category as LeanDoc).name as string) : "",
    },
    material: {
      name: isMaterialPopulated ? ((material as LeanDoc).name as string) : "",
    },
    createdAt: doc.createdAt as Date,
    updatedAt: doc.updatedAt as Date,
  };
}


