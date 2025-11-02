import multer from "multer";

const storage = multer.memoryStorage();

const uploadFile = multer({ storage }).fields([
  { name: "song", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
]);

export default uploadFile;
