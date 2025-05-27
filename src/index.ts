import express from "express";
import session from "express-session";
import { createClient } from "redis";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRouter from "./routes/auth";
import testRouter from "./routes/test";

// connect-redis v6.1.3 방식
const RedisStore = require("connect-redis")(session);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Redis 클라이언트 생성 (legacyMode 추가)
const redisClient = createClient({
  url: process.env.REDIS_URL,
  legacyMode: true, // ← 중요!
});

// Redis 이벤트 핸들링
redisClient.on("connect", () => console.log("✅ Redis connected"));
redisClient.on("error", (err) => console.error("❌ Redis Error", err));

// Redis 연결
redisClient.connect().catch(console.error);

// MongoDB 연결
const connectMongo = async () => {
  await mongoose.connect(process.env.MONGO_URI as string);
  console.log("✅ MongoDB connected");
};

app.use(express.json());

// 세션 미들웨어 설정
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1일
    },
  })
);

// 라우터 연결
app.use("/auth", authRouter);
app.use("/test", testRouter);

// DB와 Redis 연결 후 서버 시작
Promise.all([connectMongo(), redisClient.ping()])
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Startup failed", err);
    process.exit(1);
  });

// 종료 시 Redis 연결 해제
process.on("SIGINT", async () => {
  await redisClient.disconnect();
  console.log("🛑 Redis disconnected");
  process.exit(0);
});
