import express from "express";
import { prisma } from "../utils/prisma.util.js";
import { Prisma } from "@prisma/client";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { refreshTokenMiddleware } from "../middlewares/refresh-token.middleware.js";
import jwt from "jsonwebtoken";
import { APPLICANT } from "../constants/resume.constant.js";
import {
  createdResumeValidator,
  updatedResumeValidator,
  statusUpdatedValidator,
} from "../middlewares/validators/resume.validator.middleware.js";
import { requireRoles } from "../middlewares/roles.middleware.js";

const router = express.Router();

// 이력서 생성 API
router.post(
  "/resume",
  authMiddleware,
  createdResumeValidator,
  async (req, res, next) => {
    try {
      const { userId } = req.user;
      const { title, introduce } = req.body;
      const resume = await prisma.resume.create({
        data: {
          authorId: userId,
          title: title,
          introduce: introduce,
        },
      });
      return res.status(201).json({
        status: res.statusCode,
        message: "새로운 이력서가 생성 되었습니다.",
        data: resume,
      });
    } catch (err) {
      next(err);
    }
  }
);

// 이력서 목록 조회 API
router.get("/resume", authMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { sort, status } = req.query;
    const obj = { status };
    const role = req.user.UserInfo.role;

    if (role == APPLICANT) {
      obj.authorId = +userId;
    }
    const resume = await prisma.resume.findMany({
      where: obj,
      select: {
        resumeId: true,
        title: true,
        introduce: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            UserInfo: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: {
        createdAt: sort,
      },
    });
    if (resume == "") {
      return res.status(200).json({ status: res.statusCode, data: resume });
    }
    return res.status(200).json({ data: resume });
  } catch (err) {
    next(err);
  }
});

// 이력서 상세조회 API
router.get("/resume/:resumeId", authMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { resumeId } = req.params;
    const obj = { resumeId: +resumeId };
    const role = req.user.UserInfo.role;

    if (role == APPLICANT) {
      obj.authorId = +userId;
    }

    const resume = await prisma.resume.findFirst({
      where: obj,
      select: {
        resumeId: true,
        title: true,
        introduce: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            UserInfo: {
              select: { name: true },
            },
          },
        },
      },
    });
    if (!resume) {
      return res.status(400).json({
        status: res.statusCode,
        message: "이력서가 존재하지 않습니다.",
      });
    }
    return res.status(200).json({ status: res.statusCode, data: resume });
  } catch (err) {
    next(err);
  }
});

// 이력서 수정 API
router.patch(
  "/resume/:resumeId",
  authMiddleware,
  updatedResumeValidator,
  async (req, res, next) => {
    try {
      const { userId } = req.user;
      const { resumeId } = req.params;
      const { title, introduce } = req.body;

      const resume = await prisma.resume.findFirst({
        where: { authorId: +userId },
      });
      if (!resume) {
        return res
          .status(401)
          .json({ message: "작성한 이력서가 존재하지 않습니다." });
      }

      if (!(title || introduce)) {
        return res.status(401).json({
          status: res.statusCode,
          message: "수정할 정보를 입력해주세요.",
        });
      }

      const newResume = await prisma.resume.update({
        where: { resumeId: +resumeId, authorId: +userId },
        data: {
          ...(title && { title }),
          ...(introduce && { title }),
        },
      });

      return res.status(200).json({ status: res.statusCode, data: newResume });
    } catch (err) {
      if ((err.name = "PrismaClientKnownRequestError")) {
        return res.status(401).json({
          status: res.statusCode,
          message: "이력서 정보가 일치하지 않습니다.",
        });
      }
      next(err);
    }
  }
);

// 이력서 삭제 API
router.delete("/resume/:resumeId", authMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { resumeId } = req.params;
    const resume = await prisma.resume.findFirst({
      where: { authorId: +userId },
    });
    if (!resume) {
      return res.status(401).json({
        status: res.statusCode,
        message: "작성한 이력서가 존재하지 않습니다.",
      });
    }
    const deleteResume = await prisma.resume.delete({
      where: { resumeId: +resumeId, authorId: +userId },
    });

    return res.status(200).json({
      status: res.statusCode,
      message: "이력서를 삭제했습니다.",
      resumeId: resumeId,
    });
  } catch (err) {
    if ((err.name = "PrismaClientKnownRequestError")) {
      return res.status(401).json({
        status: res.statusCode,
        message: "이력서 정보가 일치하지 않습니다.",
      });
    }
    next(err);
  }
});

// 이력서 상태 수정 API
// 역할 인가 미들웨어
router.patch(
  "/resume/:resumeId/status",
  authMiddleware,
  requireRoles(["RECRUITER"]),
  statusUpdatedValidator,
  async (req, res, next) => {
    try {
      const { resumeId } = req.params;
      const { status, reason } = req.body;
      const { userId } = req.user;
      const currentResume = await prisma.resume.findFirst({
        where: {
          resumeId: +resumeId,
        },
      });
      await prisma.$transaction(
        async (tx) => {
          await tx.resume.update({
            data: { status },
            where: { resumeId: +resumeId },
          });
          await tx.resumeHistories.create({
            data: {
              ResumeId: +resumeId,
              modifier: +userId,
              newStatus: status,
              oldStatus: currentResume.status,
              reason: reason,
            },
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted }
      );
      const history = await prisma.resumeHistories.findFirst({
        where: { ResumeId: +resumeId },
        orderBy: { createdAt: "desc" },
      });
      return res.status(200).json({ status: res.statusCode, data: history });
    } catch (err) {
      next(err);
    }
  }
);

//로그 목록 조회 API
router.get(
  "/resume/:resumeId/status",
  authMiddleware,
  requireRoles(["RECRUITER"]),
  async (req, res, next) => {
    try {
      const { resumeId } = req.params;
      const resume = await prisma.resumeHistories.findMany({
        where: { ResumeId: +resumeId },
        orderBy: { createdAt: "desc" },
        include: {
          Resume: {
            select: {
              author: {
                select: {
                  UserInfo: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      return res.status(200).json({ status: res.statusCode, data: resume });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
