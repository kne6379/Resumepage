import Joi from "joi";
import { STATUS } from "../../constants/resume.constant.js";
import { MESSAGES } from "../../constants/message.constant.js";
import { MIN_RESUME_LENGTH } from "../../constants/resume.constant.js";

export const createdResumeValidator = async (req, res, next) => {
  try {
    const joiSchema = Joi.object({
      title: Joi.string().required().messages({
        "any.required": MESSAGES.RESUMES.COMMON.TITLE.REQUIRED,
      }),
      introduce: Joi.string().required().min(150).messages({
        "any.required": MESSAGES.RESUMES.COMMON.CONTENT.REQUIRED,
        "string.min": MESSAGES.RESUMES.COMMON.CONTENT.MIN_LENGTH,
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
      title: Joi.string(),
      introduce: Joi.string().min(MIN_RESUME_LENGTH).messages({
        "string.min": MESSAGES.RESUMES.COMMON.CONTENT.MIN_LENGTH,
      }),
    })
      .min(1)
      .messages({
        "object.min": MESSAGES.RESUMES.UPDATE.NO_BODY_DATA,
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
          "any.only": MESSAGES.RESUMES.UPDATE.STATUS.NO_STATUS,
          "any.required": MESSAGES.RESUMES.UPDATE.STATUS.INVALID_STATUS,
        }),
      reason: Joi.string().required().messages({
        "any.required": MESSAGES.RESUMES.UPDATE.STATUS.NO_REASON,
      }),
    });
    await joiSchema.validateAsync(req.body);
    next();
  } catch (error) {
    next(error);
  }
};
