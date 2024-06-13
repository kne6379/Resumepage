import { HTTP_STATUS } from "../constants/http-status.constant.js";
import { MESSAGES } from "../constants/message.constant.js";
import { USER_ROLE } from "../constants/resume.constant.js";

export class ResumeController {
  constructor(resumeService) {
    this.resumeService = resumeService;
  }

  createResume = async (req, res, next) => {
    try {
      const user = req.user;
      const { title, introduce } = req.body;
      const userId = user.id;

      const data = await this.resumeService.createResume(
        title,
        introduce,
        userId
      );

      return res.status(HTTP_STATUS.CREATED).json({
        status: res.statusCode,
        message: MESSAGES.RESUMES.CREATE.SUCCEED,
        data,
      });
    } catch (err) {
      next(err);
    }
  };
  getResume = async (req, res, next) => {
    try {
      const user = req.user;
      const userId = user.id;
      let { sort } = req.query;

      const whereCondition = {};
      if (user.role == USER_ROLE.RECRUITER) {
        const { status } = req.query;
        if (status) {
          whereCondition.status = status;
        }
      } else {
        whereCondition.userId = userId;
      }

      const data = await this.resumeService.getResume(sort, whereCondition);
      return res.status(HTTP_STATUS.OK).json({
        status: res.statusCode,
        message: MESSAGES.RESUMES.READ_LIST.SUCCEED,
        data,
      });
    } catch (err) {
      next(err);
    }
  };

  getResumeById = async (req, res, next) => {
    try {
      const user = req.user;
      const userId = user.id;
      const { id } = req.params;
      const whereCondition = { id: +id };

      if (user.role !== USER_ROLE.RECRUITER) {
        whereCondition.userId = userId;
      }
      const data = await this.resumeService.findResumeById(whereCondition);

      return res.status(HTTP_STATUS.OK).json({
        status: res.statusCode,
        message: MESSAGES.RESUMES.READ_DETAIL.SUCCEED,
        data,
      });
    } catch (err) {
      next(err);
    }
  };
  updateResume = async (req, res, next) => {
    try {
      const user = req.user;
      const userId = user.id;
      const { id } = req.params;
      const { title, introduce } = req.body;

      const data = await this.resumeService.updateResume(
        userId,
        id,
        title,
        introduce
      );

      return res.status(HTTP_STATUS.OK).json({
        status: res.statusCode,
        message: MESSAGES.RESUMES.UPDATE.SUCCEED,
        data,
      });
    } catch (err) {
      next(err);
    }
  };

  deleteResume = async (req, res, next) => {
    try {
      const user = req.user;
      const userId = user.id;
      const { id } = req.params;

      const data = await this.resumeService.deleteResume(userId, id);

      return res.status(HTTP_STATUS.OK).json({
        status: res.statusCode,
        message: MESSAGES.RESUMES.DELETE.SUCCEED,
        data: { id: data.id },
      });
    } catch (err) {
      next(err);
    }
  };
  updateResumeStatus = async (req, res, next) => {
    try {
      const user = req.user;
      const recruiterId = user.id;
      const { id } = req.params;
      const { status, reason } = req.body;

      const data = await this.resumeService.updateResumeStatus(
        recruiterId,
        id,
        status,
        reason
      );

      return res.status(HTTP_STATUS.OK).json({
        status: res.statusCode,
        message: MESSAGES.RESUMES.UPDATE.STATUS.SUCCEED,
        data,
      });
    } catch (err) {
      next(err);
    }
  };

  getLog = async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await this.resumeService.getLog(id);

      return res.status(HTTP_STATUS.OK).json({
        status: res.statusCode,
        message: MESSAGES.RESUMES.READ_LIST.LOG.SUCCEED,
        data,
      });
    } catch (err) {
      next(err);
    }
  };
}
