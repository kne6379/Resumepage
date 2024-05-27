import Joi from "joi";

export const createdUsersValidator = async (req, res, next) => {
  try {
    const joiSchema = Joi.object({
      email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
        .required()
        .messages({
          "string.email": "유효한 이메일이 아닙니다.",
          "any.required": "이메일을 입력해주세요.",
        }),
      name: Joi.string().required().messages({
        "string.base": "이름을 문자열로 입력해주세요.",
        "any.required": "이름을 입력해주세요.",
      }),
      password: Joi.string().min(6).max(10).required().messages({
        "string.base": "패스워드는 문자열이어야 합니다.",
        "any.required": "패스워드를 입력해주세요.",
        "string.min": "패스워드는 최소 6글자 이상이어야 합니다.",
        "string.max": "패스워드는 최대 10글자여야 합니다.",
      }),
      repeat_password: Joi.required().messages({
        "any.required": "패스워드 확인을 입력해주세요.",
      }),
    });
    await joiSchema.validateAsync(req.body);
    next();
  } catch (error) {
    next(error);
  }
};
