import { HttpError } from "../error/http.error.js";
import { MESSAGES } from "../constants/message.constant.js";

export class ResumeService {
  constructor(resumeRepository) {
    this.resumeRepository = resumeRepository;
  }

  createResume = async (title, introduce, userId) => {
    const data = this.resumeRepository.createResume(title, introduce, userId);
    return data;
  };

  getResume = async (sort, whereCondition) => {
    let data = await this.resumeRepository.findByResume(sort, whereCondition);

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
    return data;
  };

  findResumeById = async (whereCondition) => {
    let data = await this.resumeRepository.findResumeById(whereCondition);
    if (!data) {
      throw new HttpError.NotFound(MESSAGES.RESUMES.COMMON.NOT_FOUND);
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
    return data;
  };
  updateResume = async (userId, id, title, introduce) => {
    let whereCondition = { id: +id };
    await this.existedResume(whereCondition);

    const data = await this.resumeRepository.updateResume(
      userId,
      id,
      title,
      introduce
    );

    return data;
  };

  deleteResume = async (userId, id) => {
    let whereCondition = { userId, id: +id };
    await this.existedResume(whereCondition);

    const data = await this.resumeRepository.deleteResume(whereCondition);
    return data;
  };

  updateResumeStatus = async (recruiterId, id, status, reason) => {
    let whereCondition = { id: +id };

    const existedResume = await this.existedResume(whereCondition);

    const data = await this.resumeRepository.updateResumeStatus(
      recruiterId,
      id,
      status,
      reason,
      existedResume
    );
    return data;
  };

  existedResume = async (whereCondition) => {
    const existedResume =
      await this.resumeRepository.findResumeByParams(whereCondition);

    if (!existedResume) {
      throw new HttpError.NotFound(MESSAGES.RESUMES.COMMON.NOT_FOUND);
    }
    return existedResume;
  };

  getLog = async (id) => {
    let data = await this.resumeRepository.findLogs(id);
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
    return data;
  };
}
