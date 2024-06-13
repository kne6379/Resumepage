import { HTTP_STATUS } from "../constants/http-status.constant.js";
import { MESSAGES } from "../constants/message.constant.js";

export class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  signUp = async (req, res, next) => {
    try {
      const { email, password, repeat_password, name } = req.body;

      const data = await this.authService.signUp(
        email,
        password,
        repeat_password,
        name
      );
      return res.status(HTTP_STATUS.CREATED).json({
        status: res.statusCode,
        message: MESSAGES.AUTH.SIGN_UP.SUCCEED,
        data,
      });
    } catch (err) {
      next(err);
    }
  };

  signIn = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await this.authService.signIn(email, password);

      return res.status(HTTP_STATUS.OK).json({
        status: res.statusCode,
        message: MESSAGES.AUTH.SIGN_IN.SUCCEED,
        user,
      });
    } catch (err) {
      next(err);
    }
  };
  reloadToken = async (req, res, next) => {
    try {
      const user = req.user;
      const payload = { id: user.id };

      const data = await this.authService.generateAuthTokens(payload);

      return res.status(HTTP_STATUS.OK).json({
        message: MESSAGES.AUTH.TOKEN.SUCCEED,
        data,
      });
    } catch (err) {
      next(err);
    }
  };
  signOut = async (req, res, next) => {
    try {
      const user = req.user;
      const userId = user.id;

      await this.authService.signOut(userId);

      return res.status(HTTP_STATUS.OK).json({
        message: MESSAGES.AUTH.SIGN_OUT.SUCCEED,
        data: { id: userId },
      });
    } catch (err) {
      next(err);
    }
  };
}
