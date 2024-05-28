import Joi from "joi";
import { STATUS } from "../../constants/resume.constant.js";

export const createdResumeValidator = async (req, res, next) => {
  try {
    const joiSchema = Joi.object({
      title: Joi.string().required().messages({
        "string.base": "제목을 문자열로 입력해주세요.",
        "any.required": "제목을 작성해주세요.",
      }),
      introduce: Joi.string().required().min(150).messages({
        "string.base": "자기소개를 문자열로 입력해주세요.",
        "any.required": "자기소개를 작성해주세요.",
        "string.min": "자기소개는 최소 150자 이상 작성해야 합니다.",
      }),
    });
    await joiSchema.validateAsync(req.body);
    next();
  } catch (error) {
    next(error);
  }
};

export const updatedResumeValidator = async (req, res, next) => {
  try {
    const joiSchema = Joi.object({
      title: Joi.string().messages({
        "string.base": "제목을 문자열로 입력해주세요.",
      }),
      introduce: Joi.string().min(150).messages({
        "string.base": "자기소개를 문자열로 입력해주세요.",
        "string.min": "자기소개는 최소 150자 이상 작성해야 합니다.",
      }),
    });
    await joiSchema.validateAsync(req.body);
    next();
  } catch (error) {
    next(error);
  }
};

export const statusUpdatedValidator = async (req, res, next) => {
  try {
    const joiSchema = Joi.object({
      status: Joi.string()
        .valid(...Object.values(STATUS))
        .required()
        .messages({
          "string.base": "이력서 상태는 문자열이어야 합니다.",
          "any.only": "유효하지 않은 지원 상태입니다.",
          "any.required": "변경하고자 하는 지원 상태를 입력해 주세요.",
        }),
      reason: Joi.string().required().messages({
        "string.base": "사유를 문자열로 입력해주세요.",
        "any.required": "“지원 상태 변경 사유를 입력해 주세요.",
      }),
    });
    await joiSchema.validateAsync(req.body);
    next();
  } catch (error) {
    next(error);
  }
};
