import { NextFunction, Request, Response } from "express";
import { uploadImage } from "../../../utils/storage-upload";
import getChatGPTResponse from "../../../utils/chatbot";
import extractKeywords from "../../../utils/keywordExtractor";

export default class AppController {
  public static async upload(req: Request, res: Response, next: NextFunction) {
    if (!req.file && !req.files) {
      res.json({ msg: "No file uploaded." });
      return;
    }
    console.log("upload", req.file, req.files);
    try {
      if (req.file) {
        console.log("file");
        const result = await uploadImage(req.file);
        res.status(200).json({ result: `success ${result}` });
        return;
      }
      if (req.files) {
        console.log("files");
        const myfiles = req.files as any[];
        const promises: Promise<unknown>[] = [];
        myfiles.forEach(async (file: any) => {
          promises.push(uploadImage(file));
        });
        const result = await Promise.all(promises);
        res.json({ result: `success ${result}` });
        return;
      }
    } catch (e) {
      console.log("error", e);
      next(e);
    }
  }
  public static async videoDetails(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
    } catch (e) {
      console.log("error", e);
      next(e);
    }
  }
  public static async chat(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await getChatGPTResponse(req.body.msg);
      res.json({ result });
    } catch (e) {
      console.log("error", e);
      next(e);
    }
  }
  public static async extract(req: Request, res: Response, next: NextFunction) {
    try {
      const keywords = extractKeywords(req.body.chat);
      res.json({ keywords });
    } catch (e) {
      console.log("error", e);
      next(e);
    }
  }
}
