import express from "express";
import { refreshTokenMiddleware } from "../middlewares/refresh-token.middleware.js";
import { prisma } from "../utils/prisma.util.js";
import {
  createdUsersValidator,
  loginUsersValidator,
} from "../middlewares/validators/createUsers.validator.middleware.js";
import { AuthController } from "../controllers/auth.controller.js";
import { AuthService } from "../services/auth.service.js";
import { UserRepository } from "../repositories/users.repository.js";

const authRouter = express.Router();

const userRepository = new UserRepository(prisma);
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);
// 회원가입
authRouter.post("/sign-up", createdUsersValidator, authController.signUp);
// 로그인
authRouter.post("/sign-in", loginUsersValidator, authController.signIn);
// 토큰 재발급
authRouter.post("/tokens", refreshTokenMiddleware, authController.reloadToken);
// 로그아웃
authRouter.post("/sign-out", refreshTokenMiddleware, authController.signOut);

export { authRouter };
