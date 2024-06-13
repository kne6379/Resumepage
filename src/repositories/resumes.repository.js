export class ResumeRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }
  createResume = async (title, introduce, userId) => {
    const data = await this.prisma.resume.create({
      data: {
        userId,
        title,
        introduce,
      },
    });
    return data;
  };
  findByResume = async (sort, whereCondition) => {
    const data = await this.prisma.resume.findMany({
      where: whereCondition,
      orderBy: {
        createdAt: sort,
      },
      include: {
        user: true,
      },
    });
    return data;
  };
  findResumeById = async (whereCondition) => {
    const data = await this.prisma.resume.findUnique({
      where: whereCondition,
      include: { user: true },
    });
    return data;
  };

  findResumeByParams = async (whereCondition) => {
    const data = await this.prisma.resume.findUnique({
      where: whereCondition,
    });
    return data;
  };

  updateResume = async (userId, id, title, introduce) => {
    const data = await this.prisma.resume.update({
      where: { id: +id, userId },
      data: {
        ...(title && { title }),
        ...(introduce && { introduce }),
      },
    });

    return data;
  };
  deleteResume = async (whereCondition) => {
    const data = await this.prisma.resume.delete({
      where: whereCondition,
    });
    return data;
  };

  updateResumeStatus = async (
    recruiterId,
    id,
    status,
    reason,
    existedResume
  ) => {
    const data = await this.prisma.$transaction(async (tx) => {
      const updateResume = await tx.resume.update({
        where: { id: +id },
        data: { status },
      });
      const logData = await tx.resumeHistories.create({
        data: {
          recruiterId,
          resumeId: existedResume.id,
          oldStatus: existedResume.status,
          newStatus: updateResume.status,
          reason,
        },
      });
      return logData;
    });
    return data;
  };

  findLogs = async (id) => {
    const data = await this.prisma.resumeHistories.findMany({
      where: { resumeId: +id },
      orderBy: { createdAt: "desc" },
      include: { user: true },
    });
    return data;
  };
}
