// src/app.js

import express from "express";
import cookieParser from "cookie-parser";
import { SERVER_PORT } from "./constants/env.constant.js";
import { errorHandler } from "./middlewares/error-handler.middleware.js";
import UsersRouter from "./routers/users.router.js";
import ResumeRouter from "./routers/resumes.router.js";

const app = express();
const PORT = SERVER_PORT;

app.use(express.json());

app.use(cookieParser());
app.use("/api", [UsersRouter, ResumeRouter]);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(PORT, "포트로 서버가 열렸어요!");
});
