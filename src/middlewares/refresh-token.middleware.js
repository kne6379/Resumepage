import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma.util.js";
import { REFRESH_SECRET_KEY } from "../constants/user.constant.js";
import { salt } from "../constants/user.constant.js";
import bcrypt from "bcrypt";

export const refreshTokenMiddleware = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      throw new Error("토큰이 존재하지 않습니다.");
    }
    authorization;
    const [tokenType, token] = authorization.split(" ");
    if (tokenType !== "Bearer") {
      throw new Error("토큰 타입이 일치하지 않습니다.");
    }
    const decodedToken = jwt.verify(token, REFRESH_SECRET_KEY);
    const userId = decodedToken.userId;

    const user = await prisma.users.findFirst({
      where: { userId: +userId },
      include: {
        UserInfo: {
          select: {
            role: true,
            name: true,
          },
        },
      },
    });
    if (!user) {
      res.clearCookie("authorization");
      throw new Error("토큰 사용자가 존재하지 않습니다.");
    }

    const safetoken = await prisma.tokenStorage.findFirst({
      where: { authorId: +userId },
    });
    if (!(await bcrypt.compare(token, safetoken.RefreshToken))) {
      res
        .status(401)
        .json({ status: res.statusCode, message: "폐기된 인증 정보입니다." });
    }
    req.user = user;
    next();
  } catch (err) {
    console.log(err.name);
    switch (err.name) {
      case "TokenExpiredError":
        return resv
          .status(401)
          .json({ status: res.statusCode, message: "토큰이 만료되었습니다." });
        break;
      case "JsonWebTokenError":
        return res.status(401).json({
          status: res.statusCode,
          message: "토큰 인증에 실패하였습니다.",
        });
        break;
      case "TypeError":
        return res.status(401).json({
          status: res.statusCode,
          message: "삭제된 토큰입니다.",
        });
        break;
      default:
        return res
          .status(401)
          .json({ message: err.message ?? "비정상적인 요청입니다." });
    }
  }
};
