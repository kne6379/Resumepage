import express from "express";
import { usersRouter } from "./users.router.js";
import { resumesRouter } from "./resumes.router.js";
import { authRouter } from "./auth.router.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const apiRouter = express.Router();

apiRouter.use("/users", usersRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/resumes", authMiddleware, resumesRouter);

export { apiRouter };
