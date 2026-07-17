import { Schema, model, models, Model } from "mongoose";

export interface IAdmin {
  _id: string;
  username: string;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    name: { type: String, required: true, default: "Administradora" },
  },
  { timestamps: true }
);

export const Admin: Model<IAdmin> =
  models.Admin || model<IAdmin>("Admin", AdminSchema);

export default Admin;
