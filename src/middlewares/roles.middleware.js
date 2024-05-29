import { prisma } from "../utils/prisma.util.js";

export function requireRoles(role) {
  return async (req, res, next) => {
    try {
      if (role == req.user.UserInfo.role) {
        next();
      } else {
        return res
          .status(400)
          .json({ status: res.statusCode, message: "접근 권한이 없습니다." });
      }
    } catch (err) {
      next(err);
    }
  };
}
