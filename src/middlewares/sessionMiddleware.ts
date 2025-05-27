import express from "express";
import session from "express-session";
import { createClient } from "redis";

// connect-redis 타입 문제 해결
const RedisStore = require("connect-redis");

// Redis 클라이언트 생성
const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
  // 필요시 추가 옵션들
  // password: "your_redis_password",
  // database: 0,
});

// Redis 연결
redisClient.connect().catch(console.error);

export const sessionMiddleware = (app: express.Application) => {
  app.use(
    session({
      store: new RedisStore({
        client: redisClient,
        prefix: "myapp:",
      }),
      secret: process.env.SESSION_SECRET || "yourSecretKey",
      resave: false,
      saveUninitialized: false,
      cookie: { 
        maxAge: 1000 * 60 * 60 * 24, // 24시간
        secure: process.env.NODE_ENV === 'production', // HTTPS 환경에서는 true로 설정
        httpOnly: true // XSS 공격 방지
      },
    })
  );
};