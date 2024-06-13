import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { refreshTokenMiddleware } from "../middlewares/refresh-token.middleware.js";
import {
  SALT,
  ACCESS_SECRET_KEY,
  REFRESH_SECRET_KEY,
} from "../constants/user.constant.js";
import { prisma } from "../utils/prisma.util.js";
import {
  createdUsersValidator,
  loginUsersValidator,
} from "../middlewares/validators/createUsers.validator.middleware.js";
import { HTTP_STATUS } from "../constants/http-status.constant.js";
import { MESSAGES } from "../constants/message.constant.js";
import {
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
} from "../constants/user.constant.js";

const usersRouter = express.Router();

//사용자 회원가입 API
usersRouter.post("/sign-up", createdUsersValidator, async (req, res, next) => {
  try {
    const { email, password, repeat_password, name } = req.body;
    const isExistUser = await prisma.users.findFirst({
      where: { email },
    });
    // 이메일 중복처리
    if (isExistUser) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        status: res.statusCode,
        message: MESSAGES.AUTH.COMMON.EMAIL.DUPLICATED,
      });
    }
    // 비밀번호 확인
    if (password !== repeat_password) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        status: res.statusCode,
        message:
          MESSAGES.AUTH.COMMON.PASSWORD_CONFIRM.NOT_MACHTED_WITH_PASSWORD,
      });
    }
    const hashedPassword = await bcrypt.hash(password, SALT);

    const userData = await prisma.users.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    userData.password = undefined;
    return res.status(HTTP_STATUS.CREATED).json({
      status: res.statusCode,
      message: MESSAGES.AUTH.SIGN_UP.SUCCEED,
      data: userData,
    });
  } catch (err) {
    next(err);
  }
});

// 사용자 로그인 API
usersRouter.post("/sign-in", loginUsersValidator, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.users.findFirst({ where: { email } });

    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: res.statusCode,
        message: MESSAGES.AUTH.COMMON.UNAUTHORIZED,
      });
    }

    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: res.statusCode,
        message: MESSAGES.AUTH.COMMON.UNAUTHORIZED,
      });
    }
    const payload = { id: user.id };

    const data = await generateAuthTokens(payload);

    return res.status(HTTP_STATUS.OK).json({
      status: res.statusCode,
      message: MESSAGES.AUTH.SIGN_IN.SUCCEED,
      data,
    });
  } catch (err) {
    next(err);
  }
});

// 사용자 정보 조회 API
usersRouter.get("/users", authMiddleware, async (req, res, next) => {
  try {
    const data = req.user;

    return res.status(HTTP_STATUS.OK).json({ status: res.statusCode, data });
  } catch (err) {
    next(err);
  }
});

// 토큰 재발급 API
usersRouter.post("/tokens", refreshTokenMiddleware, async (req, res) => {
  const user = req.user;
  const payload = { id: user.id };

  const data = await generateAuthTokens(payload);

  return res.status(HTTP_STATUS.OK).json({
    message: MESSAGES.AUTH.TOKEN.SUCCEED,
    data,
  });
});

// 로그아웃 API
usersRouter.post("/sign-out", refreshTokenMiddleware, async (req, res) => {
  const user = req.user;
  await prisma.refreshToken.update({
    where: { userId: user.id },
    data: {
      RefreshToken: null,
    },
  });

  return res.status(HTTP_STATUS.OK).json({
    message: MESSAGES.AUTH.SIGN_OUT.SUCCEED,
    data: { id: user.id },
  });
});

const generateAuthTokens = async (payload) => {
  const userId = payload.id;

  const accessToken = jwt.sign(payload, ACCESS_SECRET_KEY, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });

  const refreshToken = jwt.sign(payload, REFRESH_SECRET_KEY, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });

  const hashedRefreshToken = bcrypt.hashSync(refreshToken, SALT);

  // RefreshToken을 생성 또는 갱신
  await prisma.refreshToken.upsert({
    where: {
      userId,
    },
    update: {
      RefreshToken: hashedRefreshToken,
    },
    create: {
      userId,
      RefreshToken: hashedRefreshToken,
    },
  });

  return { accessToken, refreshToken };
};

export { usersRouter };
