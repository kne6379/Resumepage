export class UserRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  findByUser = async (userId) => {
    // ORM인 Prisma에서 Posts 모델의 findMany 메서드를 사용해 데이터를 요청합니다.
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      omit: { password: true },
    });
    return user;
  };

  ExistUser = async (email) => {
    const isExistUser = await this.prisma.users.findUnique({
      where: { email },
    });
    return isExistUser;
  };

  createUser = async (email, password, name) => {
    const userData = await this.prisma.users.create({
      data: {
        email,
        password,
        name,
      },
    });
    return userData;
  };

  tokenUpload = async (userId, RefreshToken) => {
    const data = await this.prisma.refreshToken.upsert({
      where: {
        userId,
      },
      update: {
        RefreshToken,
      },
      create: {
        userId,
        RefreshToken,
      },
    });
    return data;
  };

  signOut = async (userId) => {
    await this.prisma.refreshToken.update({
      where: { userId },
      data: {
        RefreshToken: null,
      },
    });
  };

  refreshToken = async (userId) => {
    const data = await this.prisma.refreshToken.findUnique({
      where: { userId },
    });
    return data;
  };
}

// async (req, res, next) => {
//   try {
//     const data = req.user;

//     return res.status(HTTP_STATUS.OK).json({
//       status: res.statusCode,
//       message: MESSAGES.USERS.READ_ME.SUCCEED,
//       data,
//     });
//   } catch (err) {
//     next(err);
//   }
