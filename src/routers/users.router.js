import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { salt } from "../constants/user.constant.js";
import { prisma } from "../utils/prisma.util.js";
import { Prisma } from "@prisma/client";
import { createdUsersValidator } from "../middlewares/validators/createUsers.validator.middleware.js";

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

export default router;
