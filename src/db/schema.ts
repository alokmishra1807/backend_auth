import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId; 
  name: string;
  email: string;
  password: string;
}

const schema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Optional: Add a virtual `id` if you want cleaner JSON output
schema.virtual("id").get(function (this: IUser) {
  return this._id.toHexString();
});

const User = mongoose.model<IUser>("User", schema);

export default User;
