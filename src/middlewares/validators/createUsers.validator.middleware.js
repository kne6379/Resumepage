import { MESSAGES } from "../../constants/message.constant.js";
import Joi from "joi";

export const createdUsersValidator = async (req, res, next) => {
  try {
    const joiSchema = Joi.object({
      email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
        .required()
        .messages({
          "string.email": MESSAGES.AUTH.COMMON.EMAIL.INVALID_FORMAT,
          "any.required": MESSAGES.AUTH.COMMON.EMAIL.REQUIRED,
        }),
      name: Joi.string().required().messages({
        "string.base": MESSAGES.AUTH.COMMON.NAME.STRING,
        "any.required": MESSAGES.AUTH.COMMON.NAME.REQURIED,
      }),
      password: Joi.string().min(6).required().messages({
        "any.required": MESSAGES.AUTH.COMMON.PASSWORD.REQURIED,
        "string.min": MESSAGES.AUTH.COMMON.PASSWORD.MIN_LENGTH,
      }),
      repeat_password: Joi.string().required().messages({
        "any.required": MESSAGES.AUTH.COMMON.PASSWORD_CONFIRM.REQURIED,
      }),
    });
    await joiSchema.validateAsync(req.body);
    next();
  } catch (error) {
    next(error);
  }
};

export const loginUsersValidator = async (req, res, next) => {
  try {
    const joiSchema = Joi.object({
      email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
        .required()
        .messages({
          "string.email": MESSAGES.AUTH.COMMON.EMAIL.INVALID_FORMAT,
          "any.required": MESSAGES.AUTH.COMMON.EMAIL.REQUIRED,
        }),
      password: Joi.string().min(6).required().messages({
        "any.required": MESSAGES.AUTH.COMMON.PASSWORD.REQURIED,
      }),
    });
    await joiSchema.validateAsync(req.body);
    next();
  } catch (error) {
    next(error);
  }
};
