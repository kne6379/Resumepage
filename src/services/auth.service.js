import { MESSAGES } from "../constants/message.constant.js";
import { HttpError } from "../error/http.error.js";
import bcrypt from "bcrypt";
import {
  ACCESS_SECRET_KEY,
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_SECRET_KEY,
  REFRESH_TOKEN_EXPIRES_IN,
  SALT,
} from "../constants/user.constant.js";
import jwt from "jsonwebtoken";

export class AuthService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  signUp = async (email, password, repeat_password, name) => {
    const isExistUser = await this.userRepository.ExistUser(email);
    if (isExistUser) {
      throw new HttpError.BadRequest(MESSAGES.AUTH.COMMON.EMAIL.DUPLICATED);
    }
    // 비밀번호 확인
    if (password !== repeat_password) {
      throw new HttpError.Conflict(
        MESSAGES.AUTH.COMMON.PASSWORD_CONFIRM.NOT_MACHTED_WITH_PASSWORD
      );
    }
    const hashedPassword = await bcrypt.hash(password, SALT);
    const userData = await this.userRepository.createUser(
      email,
      hashedPassword,
      name
    );
    userData.password = undefined;
    return userData;
  };

  signIn = async (email, password) => {
    // 유저 정보 검색
    const user = await this.userRepository.ExistUser(email);
    if (!user) {
      throw new HttpError.Unauthorized(MESSAGES.AUTH.COMMON.UNAUTHORIZED);
    }
    // 비밀번호 검사
    if (!(await bcrypt.compare(password, user.password))) {
      throw new HttpError.Unauthorized(MESSAGES.AUTH.COMMON.UNAUTHORIZED);
    }

    const payload = { id: user.id };

    const data = await this.generateAuthTokens(payload);

    return data;
  };

  generateAuthTokens = async (payload) => {
    const userId = payload.id;

    const accessToken = jwt.sign(payload, ACCESS_SECRET_KEY, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });

    const refreshToken = jwt.sign(payload, REFRESH_SECRET_KEY, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });

    const hashedRefreshToken = bcrypt.hashSync(refreshToken, SALT);

    await this.userRepository.tokenUpload(userId, hashedRefreshToken);
    // RefreshToken을 생성 또는 갱신
    return { accessToken, refreshToken };
  };

  signOut = async (userId) => {
    await this.userRepository.signOut(userId);
  };
}
