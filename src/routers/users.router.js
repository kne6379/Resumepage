import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { salt, SECRET_KEY } from "../constants/user.constant.js";
import { prisma } from "../utils/prisma.util.js";
import { Prisma } from "@prisma/client";
import {
  createdUsersValidator,
  loginUsersValidator,
} from "../middlewares/validators/createUsers.validator.middleware.js";
const router = express.Router();

//사용자 회원가입 API
router.post("/sign-up", createdUsersValidator, async (req, res, next) => {
  try {
    const { email, password, repeat_password, name } = req.body;
    const isExistUser = await prisma.users.findFirst({
      where: { email },
    });
    if (isExistUser) {
      return res.status(409).json({ message: "이미 존재하는 이메일입니다." });
    }
    if (password !== repeat_password) {
      return res
        .status(409)
        .json({ message: "입력한 두 비밀번호가 일치하지 않습니다." });
    }
    const hashedPassword = await bcrypt.hash(password, salt);

    const [user, userInfo] = await prisma.$transaction(
      async (tx) => {
        const user = await tx.users.create({
          data: {
            email,
            password: hashedPassword,
          },
        });

        const userInfo = await tx.userInfo.create({
          data: {
            authorId: user.userId,
            name,
          },
        });
        return [user, userInfo];
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted }
    );
    return res.status(201).json({
      data: {
        userId: user.userId,
        email: user.email,
        name: userInfo.name,
        role: userInfo.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      message: "회원가입이 완료되었습니다.",
    });
  } catch (err) {
    next(err);
  }
});

// 사용자 로그인 API
router.post("/sign-in", loginUsersValidator, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.users.findFirst({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "존재하지 않는 이메일입니다." });
    }
    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
    }
    const ACCESSTOKEN = jwt.sign(
      {
        userId: user.userId,
      },
      SECRET_KEY,
      { expiresIn: "12h" }
    );
    // res.header("authorization", `Bearer ${token}`);
    return res
      .status(200)
      .json({ message: "로그인에 성공했습니다.", ACCESSTOKEN });
  } catch (err) {
    next(err);
  }
});

// 사용자 정보 조회 API
router.get("/users", authMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.user;
    const user = await prisma.users.findFirst({
      where: { userId: +userId },
      select: {
        userId: true,
        email: true,
        UserInfo: {
          select: {
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
    return res.status(200).json({ data: user });
  } catch (err) {
    next(err);
  }
});
export default router;
