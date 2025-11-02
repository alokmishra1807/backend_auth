import express, { Request, response, Response, Router } from "express";

import { auth, AuthRequest } from "../middlewares/auth";
import { v2 as cloudinary } from "cloudinary";
import uploadFile from "../middlewares/multer";
import { Favorite, Song } from "../db/schema";
import { request } from "http";


const songRouter = Router();




// Upload song + thumbnail
songRouter.post("/upload",auth, uploadFile, async (req: AuthRequest, res: Response) => {
  try {
    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    if (!files.song || !files.thumbnail) {
      return res.status(400).json({ message: "Song and thumbnail required" });
    }

    const { artist, song_name, hex_code } = req.body;

    // Upload song to Cloudinary (as audio)
    const songUpload = await cloudinary.uploader.upload_stream(
      {
        resource_type: "video", // needed for audio files
        folder: "songs",
      },
      async (error, result) => {
        if (error) throw error;
      }
    );

    // But since we’re using memoryStorage, we’ll handle it via buffer manually
    const uploadToCloudinary = (fileBuffer: Buffer, options: any) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
        stream.end(fileBuffer);
      });
    };

    const songResult: any = await uploadToCloudinary(files.song[0].buffer, {
      resource_type: "video",
      folder: "songs",
    });

    const thumbResult: any = await uploadToCloudinary(files.thumbnail[0].buffer, {
      resource_type: "image",
      folder: "thumbnails",
    });

    // Save song info to DB
    const newSong = new Song({
      song_url: songResult.secure_url,
      thumbnail_url: thumbResult.secure_url,
      artist,
      song_name,
      hex_code,
    });

    await newSong.save();

    res.status(201).json({
      message: "Song uploaded successfully",
      data: newSong,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

songRouter.get("/list", async (req: Request, res: Response) => {
  try {
    const songs = await Song.find();
    res.status(200).json(songs);
  } catch (err: any) {
    res.status(500).json({ message: "Failed to fetch songs", error: err.message });
  }
});

songRouter.post("/favorite", auth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user; // comes from your auth middleware
    const { songId } = req.body;

    if (!songId) return res.status(400).json({ message: "songId required" });

    const existingFav = await Favorite.findOne({ songId,  userId });

    if (existingFav) {
      await Favorite.findByIdAndDelete(existingFav._id);
      return res.status(200).json({ message: false });
    } else {
      const newFav = new Favorite({
        
        songId,
        userId,
      });
      await newFav.save();
      return res.status(201).json({ message: true });
    }
  } catch (err: any) {
    res.status(500).json({ message: "Failed to toggle favorite", error: err.message });
  }
});



songRouter.get("/list/favorites", auth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user;
    const favorites = await Favorite.find({userId }).populate("songId");
    res.status(200).json(favorites);
  } catch (err: any) {
    res.status(500).json({ message: "Failed to fetch favorite songs", error: err.message });
  }
});


export default songRouter;


