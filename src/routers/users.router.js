import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { refreshTokenMiddleware } from "../middlewares/refresh-token.middleware.js";
import {
  salt,
  ACCESS_SECRET_KEY,
  REFRESH_SECRET_KEY,
} from "../constants/user.constant.js";
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
      return res.status(409).json({
        status: res.statusCode,
        message: "이미 존재하는 이메일입니다.",
      });
    }
    if (password !== repeat_password) {
      return res.status(409).json({
        status: res.statusCode,
        message: "입력한 두 비밀번호가 일치하지 않습니다.",
      });
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
      status: res.statusCode,
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
      return res.status(401).json({
        status: res.statusCode,
        message: "존재하지 않는 이메일입니다.",
      });
    }
    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        status: res.statusCode,
        message: "비밀번호가 일치하지 않습니다.",
      });
    }
    const ACCESSTOKEN = createAccessToken(user.userId);
    const REFRESHTOKEN = createRefreshToken(user.userId);
    const SAFEREFRESHTOKEN = await bcrypt.hash(REFRESHTOKEN, salt);

    await prisma.tokenStorage.create({
      data: {
        RefreshToken: SAFEREFRESHTOKEN,
        authorId: user.userId,
      },
    });
    return res.status(200).json({
      status: res.statusCode,
      message: "로그인에 성공했습니다.",
      ACCESSTOKEN,
      REFRESHTOKEN,
    });
  } catch (err) {
    if ((err.name = "PrismaClientKnownRequestError")) {
      return res
        .status(401)
        .json({ status: res.statusCode, message: "이미 로그인한 상태입니다." });
    }
    next(err);
  }
});

function createAccessToken(id) {
  return jwt.sign({ userId: id }, ACCESS_SECRET_KEY, {
    expiresIn: "12h",
  });
}
function createRefreshToken(id) {
  return jwt.sign({ userId: id }, REFRESH_SECRET_KEY, {
    expiresIn: "7d",
  });
}

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
    return res.status(200).json({ status: res.statusCode, data: user });
  } catch (err) {
    next(err);
  }
});

// 토큰 재발급 API
router.post("/tokens", refreshTokenMiddleware, async (req, res) => {
  const { userId } = req.user;
  const ACCESSTOKEN = createAccessToken(userId);
  const REFRESHTOKEN = createRefreshToken(userId);
  const SAFEREFRESHTOKEN = await bcrypt.hash(REFRESHTOKEN, salt);
  await prisma.tokenStorage.update({
    where: { authorId: +userId },
    data: {
      RefreshToken: SAFEREFRESHTOKEN,
      authorId: +userId,
    },
  });

  return res.status(200).json({
    message: "새로운 Token이 발급 되었습니다.",
    ACCESSTOKEN,
    REFRESHTOKEN,
  });
});

// 로그아웃 API
router.delete("/tokens", refreshTokenMiddleware, async (req, res) => {
  const { userId } = req.user;
  await prisma.tokenStorage.delete({
    where: { authorId: +userId },
  });

  return res.status(200).json({
    message: "해당 토큰이 삭제되었습니다.",
    userId: userId,
  });
});

export default router;
