import "dotenv/config";

export const SALT = 10;
export const ACCESS_SECRET_KEY = process.env.ACCESS_SECRET_KEY;
export const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY;

export const MIN_PASSWORD_LENGTH = 6;
export const ACCESS_TOKEN_EXPIRES_IN = "12h";
export const REFRESH_TOKEN_EXPIRES_IN = "7d";
