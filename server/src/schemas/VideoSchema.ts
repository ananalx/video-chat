import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
});

const VideoSchema = new mongoose.Schema(
  {
    videoId: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    location: locationSchema,
  },
  { collection: "videoDetails" }
);

const Video = mongoose.model("VideoSchema", VideoSchema);

export default Video;
