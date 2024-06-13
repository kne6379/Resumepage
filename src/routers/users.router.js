import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { UserController } from "../controllers/user.controller.js";
import { UserRepository } from "../repositories/users.repository.js";
import { prisma } from "../utils/prisma.util.js";

const usersRouter = express.Router();

const userRepository = new UserRepository(prisma);
const userController = new UserController(userRepository);

usersRouter.get("/me", authMiddleware, userController.getUser);
export { usersRouter };
