import Joi from "joi";

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
