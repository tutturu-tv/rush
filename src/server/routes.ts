import express, { Application } from "express";
import path from "path";

export default (app: Application) => {
  app.use("/static", express.static(path.join(__dirname, "../client")));

  app.get("/", (_req, res) => {
    res.sendFile(path.join(__dirname, "../client/index.html"));
  });
};
