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



// Define the TypeScript interface for type safety
export interface ISong extends Document {

  song_url: string;
  thumbnail_url: string;
  artist: string;
  song_name: string;
  hex_code: string;
}

// Define the Mongoose schema
const SongSchema = new Schema<ISong>({
 
  song_url: {
    type: String,
    required: true,
  },
  thumbnail_url: {
    type: String,
    required: false,
  },
  artist: {
    type: String,
    required: false,
  },
  song_name: {
    type: String,
    required: true,
    maxlength: 100,
  },
  hex_code: {
    type: String,
    required: false,
    maxlength: 6,
  },
}, { timestamps: true });

// Create the model
export const Song = mongoose.model<ISong>("Song", SongSchema);

export interface IFavorite extends Document {
  userId: string;
  songId: string;
  createdAt: Date;
}

const FavoriteSchema = new Schema<IFavorite>(
  {
    userId: {
      type: String,
      required: true,
      ref: "User", // Reference to User model
    },
    songId: {
      type: String,
      required: true,
      ref: "Song", // Reference to Song model
    },
    createdAt: {
      type: Date,
      default: Date.now, // Auto-set current timestamp
    },
  },
  {
    timestamps: false, // createdAt handled manually above
    versionKey: false, // remove __v
  }
);

export const Favorite = mongoose.model<IFavorite>("Favorite", FavoriteSchema);
