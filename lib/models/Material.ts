import { Schema, model, models, Model } from "mongoose";

export interface IMaterial {
  _id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const MaterialSchema = new Schema<IMaterial>(
  {
    name: { type: String, required: true, trim: true, unique: true },
  },
  { timestamps: true }
);

export const Material: Model<IMaterial> =
  models.Material || model<IMaterial>("Material", MaterialSchema);

export default Material;
