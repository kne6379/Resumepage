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

const resumesRouter = express.Router();

// 이력서 생성 API
resumesRouter.post("/", createdResumeValidator, async (req, res, next) => {
  try {
    const user = req.user;
    const { title, introduce } = req.body;
    const userId = user.id;

    const data = await prisma.resume.create({
      data: {
        userId,
        title,
        introduce,
      },
    });

    return res.status(HTTP_STATUS.CREATED).json({
      status: res.statusCode,
      message: MESSAGES.RESUMES.CREATE.SUCCEED,
      data,
    });
  } catch (err) {
    next(err);
  }
});

// 이력서 목록 조회 API
resumesRouter.get("/", async (req, res, next) => {
  try {
    const user = req.user;
    const userId = user.id;

    let { sort } = req.query;

    sort = sort?.toLowerCase();

    if (sort !== "desc" && sort !== "asc") {
      sort = "desc";
    }

    const whereCondition = {};
    if (user.role == USER_ROLE.RECRUITER) {
      const { status } = req.query;
      if (status) {
        whereCondition.status = status;
      }
    } else {
      whereCondition.userId = userId;
    }
    let data = await prisma.resume.findMany({
      where: whereCondition,
      orderBy: {
        createdAt: sort,
      },
      include: {
        user: true,
      },
    });
    data = data.map((resume) => {
      return {
        id: resume.id,
        name: resume.user.name,
        title: resume.title,
        introduce: resume.introduce,
        status: resume.status,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt,
      };
    });

    return res.status(HTTP_STATUS.OK).json({
      status: res.statusCode,
      message: MESSAGES.RESUMES.READ_LIST.SUCCEED,
      data,
    });
  } catch (err) {
    next(err);
  }
});

// 이력서 상세조회 API
resumesRouter.get("/:id", async (req, res, next) => {
  try {
    const user = req.user;
    const userId = user.id;
    const { id } = req.params;

    const whereCondition = { id: +id };

    if (user.role !== USER_ROLE.RECRUITER) {
      whereCondition.userId = userId;
    }

    let data = await prisma.resume.findUnique({
      where: whereCondition,
      include: { user: true },
    });

    if (!data) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        status: res.statusCode,
        message: MESSAGES.RESUMES.COMMON.NOT_FOUND,
      });
    }

    data = {
      id: data.id,
      name: data.user.name,
      title: data.title,
      introduce: data.introduce,
      status: data.status,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };

    return res.status(HTTP_STATUS.OK).json({
      status: res.statusCode,
      message: MESSAGES.RESUMES.READ_DETAIL.SUCCEED,
      data,
    });
  } catch (err) {
    next(err);
  }
});

// 이력서 수정 API
resumesRouter.patch("/:id", updatedResumeValidator, async (req, res, next) => {
  try {
    const user = req.user;
    const userId = user.id;

    const { id } = req.params;

    const { title, introduce } = req.body;

    let existedResume = await prisma.resume.findUnique({
      where: { id: +id },
    });

    if (!existedResume) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ message: MESSAGES.RESUMES.COMMON.NOT_FOUND });
    }

    const data = await prisma.resume.update({
      where: { id: +id, userId },
      data: {
        ...(title && { title }),
        ...(introduce && { introduce }),
      },
    });

    return res.status(HTTP_STATUS.OK).json({
      status: res.statusCode,
      message: MESSAGES.RESUMES.UPDATE.SUCCEED,
      data,
    });
  } catch (err) {
    next(err);
  }
});

// 이력서 삭제 API
resumesRouter.delete("/:id", async (req, res, next) => {
  try {
    const user = req.user;
    const userId = user.id;
    const { id } = req.params;

    const resume = await prisma.resume.findFirst({
      where: { id: +id, userId },
    });

    if (!resume) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        status: res.statusCode,
        message: MESSAGES.RESUMES.COMMON.NOT_FOUND,
      });
    }
    const data = await prisma.resume.delete({
      where: { id: +id, userId },
    });

    return res.status(HTTP_STATUS.OK).json({
      status: res.statusCode,
      message: MESSAGES.RESUMES.DELETE.SUCCEED,
      data: { id: data.id },
    });
  } catch (err) {
    next(err);
  }
});

// 이력서 상태 수정 API
// 역할 인가 미들웨어
resumesRouter.patch(
  "/:id/status",
  requireRoles(["RECRUITER"]),
  statusUpdatedValidator,
  async (req, res, next) => {
    try {
      const user = req.user;
      const recruiterId = user.id;
      const { id } = req.params;
      const { status, reason } = req.body;

      await prisma.$transaction(
        async (tx) => {
          const existedResume = await tx.resume.findUnique({
            where: { id: +id },
          });

          if (!existedResume) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
              status: res.statusCode,
              message: MESSAGES.RESUMES.COMMON.NOT_FOUND,
            });
          }

          const updateResume = await tx.resume.update({
            where: { id: +id },
            data: { status },
          });

          const data = await tx.resumeHistories.create({
            data: {
              recruiterId,
              resumeId: existedResume.id,
              oldStatus: existedResume.status,
              newStatus: updateResume.status,
              reason,
            },
          });
          return res.status(HTTP_STATUS.OK).json({
            status: res.statusCode,
            message: MESSAGES.RESUMES.UPDATE.STATUS.SUCCEED,
            data,
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted }
      );
    } catch (err) {
      next(err);
    }
  }
);

//로그 목록 조회 API
resumesRouter.get(
  "/:id/logs",
  requireRoles(["RECRUITER"]),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      let data = await prisma.resumeHistories.findMany({
        where: { resumeId: +id },
        orderBy: { createdAt: "desc" },
        include: {
          user: true,
        },
      });

      data = data.map((log) => {
        return {
          id: log.id,
          name: log.user.name,
          resumeId: log.resumeId,
          oldStatus: log.oldStatus,
          newStatus: log.newStatus,
          reason: log.reason,
          createdAt: log.createdAt,
        };
      });
      return res.status(HTTP_STATUS.OK).json({
        status: res.statusCode,
        message: MESSAGES.RESUMES.READ_LIST.LOG.SUCCEED,
        data,
      });
    } catch (err) {
      next(err);
    }
  }
);

export { resumesRouter };
