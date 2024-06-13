import { HTTP_STATUS } from "../constants/http-status.constant.js";
import { MESSAGES } from "../constants/message.constant.js";

export function requireRoles(role) {
  return async (req, res, next) => {
    try {
      const user = req.user;

      const hasPermission = user && role.includes(user.role);
      if (!hasPermission) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          status: res.statusCode,
          message: MESSAGES.AUTH.COMMON.FORBIDDEN,
        });
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}
