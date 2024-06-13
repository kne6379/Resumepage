import { HTTP_STATUS } from "../constants/http-status.constant.js";
import { MESSAGES } from "../constants/message.constant.js";

export class UserController {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  getUser = async (req, res, next) => {
    try {
      const user = req.user;
      const userId = user.id;
      const data = await this.userRepository.findByUser(userId);

      return res.status(HTTP_STATUS.OK).json({
        status: res.statusCode,
        message: MESSAGES.USERS.READ_ME.SUCCEED,
        data,
      });
    } catch (err) {
      next(err);
    }
  };
}
