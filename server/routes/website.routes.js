import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  changes,
  generateWebsite,
  getWebsiteById,
  userWebsites,
  deployWebsite,
  getBySlugPublic,
} from "../controllers/website.controllers.js";

const websiteRouter = express.Router();

websiteRouter.post("/generate", isAuth, generateWebsite);
websiteRouter.post("/update/:id", isAuth, changes);
websiteRouter.get("/userWebsites", isAuth, userWebsites);
websiteRouter.get("/deployWebsite/:id", isAuth, deployWebsite);
websiteRouter.get("/site/:slug", getBySlugPublic);
websiteRouter.get("/:id", isAuth, getWebsiteById);

export default websiteRouter;
