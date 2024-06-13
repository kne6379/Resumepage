import express from "express";
import { prisma } from "../utils/prisma.util.js";
import { Prisma } from "@prisma/client";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { USER_ROLE } from "../constants/resume.constant.js";
import {
  createdResumeValidator,
  updatedResumeValidator,
  statusUpdatedValidator,
} from "../middlewares/validators/resume.validator.middleware.js";
import { requireRoles } from "../middlewares/roles.middleware.js";
import { HTTP_STATUS } from "../constants/http-status.constant.js";
import { MESSAGES } from "../constants/message.constant.js";
import { ResumeController } from "../controllers/resume.controller.js";
import { ResumeService } from "../services/resumes.service.js";
import { ResumeRepository } from "../repositories/resumes.repository.js";

const resumesRouter = express.Router();

const resumeRepository = new ResumeRepository(prisma);
const resumeService = new ResumeService(resumeRepository);
const resumeController = new ResumeController(resumeService);

// 이력서 생성 API
resumesRouter.post("/", createdResumeValidator, resumeController.createResume);

// 이력서 목록 조회 API
resumesRouter.get("/", resumeController.getResume);

// 이력서 상세조회 API
resumesRouter.get("/:id", resumeController.getResumeById);

// 이력서 수정 API
resumesRouter.patch(
  "/:id",
  updatedResumeValidator,
  resumeController.updateResume
);

// 이력서 삭제 API
resumesRouter.delete("/:id", resumeController.deleteResume);

// 이력서 상태 수정 API
// 역할 인가 미들웨어
resumesRouter.patch(
  "/:id/status",
  requireRoles(["RECRUITER"]),
  statusUpdatedValidator,
  resumeController.updateResumeStatus
);

resumesRouter.get(
  "/:id/logs",
  requireRoles(["RECRUITER"]),
  resumeController.getLog
);
//로그 목록 조회 API
// resumesRouter.get(
//   "/:id/logs",
//   requireRoles(["RECRUITER"]),
//   async (req, res, next) => {
//     try {
//       const { id } = req.params;
//       let data = await prisma.resumeHistories.findMany({
//         where: { resumeId: +id },
//         orderBy: { createdAt: "desc" },
//         include: {
//           user: true,
//         },
//       });

//       data = data.map((log) => {
//         return {
//           id: log.id,
//           name: log.user.name,
//           resumeId: log.resumeId,
//           oldStatus: log.oldStatus,
//           newStatus: log.newStatus,
//           reason: log.reason,
//           createdAt: log.createdAt,
//         };
//       });
//       return res.status(HTTP_STATUS.OK).json({
//         status: res.statusCode,
//         message: MESSAGES.RESUMES.READ_LIST.LOG.SUCCEED,
//         data,
//       });
//     } catch (err) {
//       next(err);
//     }
//   }
// );

export { resumesRouter };
