import { Schema, model, models, Model } from "mongoose";

export interface ICategory {
  _id: string;
  name: string;
  billboard: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    billboard: { type: String, required: true },
  },
  { timestamps: true }
);

export const Category: Model<ICategory> =
  models.Category || model<ICategory>("Category", CategorySchema);

export default Category;
