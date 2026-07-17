import { Schema, model, models, Model, Types } from "mongoose";

export interface IProduct {
  _id: string;
  name: string;
  price: number;
  stock: number;
  isFeatured: boolean;
  isArchived: boolean;
  images: string[];
  category_id: Types.ObjectId;
  material_id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    images: { type: [String], default: [] },
    category_id: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    material_id: { type: Schema.Types.ObjectId, ref: "Material", required: true },
  },
  { timestamps: true }
);

ProductSchema.index({ isFeatured: 1 });
ProductSchema.index({ isArchived: 1 });
ProductSchema.index({ category_id: 1 });
ProductSchema.index({ material_id: 1 });
ProductSchema.index({ name: "text" });
// Cubre la consulta más frecuente (productos activos, filtrados y
// ordenados por fecha) sin tener que combinar varios índices simples.
ProductSchema.index({ isArchived: 1, isFeatured: 1, createdAt: -1 });

export const Product: Model<IProduct> =
  models.Product || model<IProduct>("Product", ProductSchema);

export default Product;
