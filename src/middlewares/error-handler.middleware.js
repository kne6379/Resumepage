import { HttpError } from "../error/http.error.js";

export const errorHandler = (err, req, res, next) => {
  console.error(err);
  // joi에서 발생한 에러 처리
  if (err.constructor?.name in HttpError) {
    return res
      .status(err.status)
      .json({ status: res.statusCode, message: err.message });
  }
  if (err.name === "ValidationError") {
    return res.status(400).json({
      status: 400,
      message: err.message,
    });
  }

  if (err.code == "P2025") {
    return res.status(400).json({
      status: res.statusCode,
      message: "수정할 수 없는 이력서입니다.",
    });
  }
  // 그 밖의 예상치 못한 에러 처리
  return res.status(500).json({
    status: 500,
    message: "예상치 못한 에러가 발생했습니다. 관리자에게 문의해 주세요.",
  });
};
