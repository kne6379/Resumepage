// src/app.js

import express from "express";
import cookieParser from "cookie-parser";
import { SERVER_PORT } from "./constants/env.constant.js";

const app = express();
const PORT = SERVER_PORT;

app.use(express.json());
app.use(cookieParser());

app.listen(PORT, () => {
  console.log(PORT, "포트로 서버가 열렸어요!");
});
