import express from "express";
import session from "express-session";
import { createClient } from "redis";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

// 라우터 import
import authRouter from "./routes/auth";
import testRouter from "./routes/test";
import ConcertRouter from "./routes/concertRoutes";

// connect-redis v6.1.3 방식
const RedisStore = require("connect-redis")(session);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS 설정
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

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

// 미들웨어 설정
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

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

// Swagger 설정
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Concert & Auth API",
      version: "1.0.0",
      description:
        "콘서트 관리 및 인증 API with Redis Session & S3 Integration",
      contact: {
        name: "API Support",
        email: "support@concertapi.com",
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Development server",
      },
    ],
    tags: [
      {
        name: "Auth",
        description: "사용자 인증 관리 (MongoDB + Redis Session)",
      },
      {
        name: "Concerts",
        description: "콘서트 정보 관리 (S3 Image URLs)",
      },
      {
        name: "Test",
        description: "세션 테스트 및 Redis 관리",
      },
    ],
    components: {
      schemas: {
        Concert: {
          type: "object",
          required: ["uid", "title", "artist", "venue", "date"],
          properties: {
            uid: {
              type: "string",
              description: "Unique identifier with timestamp",
              example: "concert_1703123456789_abc123",
            },
            title: {
              type: "string",
              description: "Concert title",
              example: "아이유 콘서트 2024",
            },
            artist: {
              type: "string",
              description: "Artist name",
              example: "아이유",
            },
            venue: {
              type: "string",
              description: "Concert venue",
              example: "올림픽공원 체조경기장",
            },
            date: {
              type: "string",
              format: "date",
              description: "Concert date",
              example: "2024-06-15",
            },
            time: {
              type: "string",
              description: "Concert time",
              example: "19:00",
            },
            price: {
              type: "number",
              description: "Ticket price (KRW)",
              example: 150000,
            },
            description: {
              type: "string",
              description: "Concert description",
              example: "아이유의 특별한 콘서트",
            },
            category: {
              type: "string",
              enum: [
                "pop",
                "rock",
                "jazz",
                "classical",
                "hiphop",
                "electronic",
                "indie",
                "folk",
                "r&b",
                "country",
                "musical",
                "opera",
                "other",
              ],
              description: "Music category",
              example: "pop",
            },
            ticketLink: {
              type: "string",
              format: "uri",
              description: "Ticket purchase link",
              example: "https://ticket.interpark.com/...",
            },
            posterImage: {
              type: "string",
              format: "uri",
              description: "S3 poster image URL (uploaded by frontend)",
              example:
                "https://your-bucket.s3.amazonaws.com/concerts/poster.jpg",
            },
            galleryImages: {
              type: "array",
              items: {
                type: "string",
                format: "uri",
              },
              description:
                "Array of S3 gallery image URLs (uploaded by frontend)",
              example: [
                "https://your-bucket.s3.amazonaws.com/concerts/gallery1.jpg",
                "https://your-bucket.s3.amazonaws.com/concerts/gallery2.jpg",
              ],
            },
            tags: {
              type: "array",
              items: {
                type: "string",
              },
              description: "Concert tags",
              example: ["발라드", "K-POP", "솔로"],
            },
            status: {
              type: "string",
              enum: ["upcoming", "ongoing", "completed", "cancelled"],
              description: "Concert status",
              example: "upcoming",
            },
          },
        },
        User: {
          type: "object",
          required: ["username", "password"],
          properties: {
            username: {
              type: "string",
              description: "Username",
              example: "john_doe",
            },
            password: {
              type: "string",
              description: "Password (minimum 6 characters)",
              example: "password123",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Error message",
            },
            error: {
              type: "string",
              description: "Detailed error information",
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"], // Swagger 주석이 있는 파일들
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Swagger UI 설정
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Concert & Auth API Documentation",
    customfavIcon: "/favicon.ico",
  })
);

// 기본 라우트
app.get("/", (req, res) => {
  res.json({
    message: "Concert & Auth API Server",
    version: "1.0.0",
    description:
      "Frontend uploads images to S3, then sends concert info with S3 URLs to backend",
    endpoints: {
      documentation: "/api-docs",
      auth: "/auth",
      test: "/test",
      concerts: "/concert",
    },
    features: [
      "User Authentication (MongoDB + Redis Session)",
      "Concert Management (S3 Image Integration)",
      "Session Management & Testing",
      "Swagger API Documentation",
    ],
    swagger: `http://localhost:${PORT}/api-docs`,
    timestamp: new Date().toISOString(),
  });
});

// 헬스체크 라우트
app.get("/health", async (req, res) => {
  try {
    // MongoDB 연결 상태 확인
    const mongoStatus =
      mongoose.connection.readyState === 1 ? "connected" : "disconnected";

    // Redis 연결 상태 확인
    const redisStatus = redisClient.isOpen ? "connected" : "disconnected";

    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        mongodb: mongoStatus,
        redis: redisStatus,
      },
      uptime: process.uptime(),
    });
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// 라우터 연결
app.use("/auth", authRouter);
app.use("/test", testRouter);
app.use("/concert", ConcertRouter);


// 에러 핸들링 미들웨어
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("🔥 Error:", err);

    // 개발 환경에서는 상세 에러, 프로덕션에서는 간단한 메시지
    const isDevelopment = process.env.NODE_ENV === "development";

    res.status(err.status || 500).json({
      message: err.message || "서버 내부 에러",
      error: isDevelopment
        ? {
            stack: err.stack,
            details: err.message,
          }
        : "알 수 없는 에러",
      timestamp: new Date().toISOString(),
    });
  }
);

// 404 핸들러
app.use("*", (req, res) => {
  res.status(404).json({
    message: "요청한 경로를 찾을 수 없습니다.",
    requestedPath: req.originalUrl,
    method: req.method,
    availableEndpoints: {
      documentation: "GET /api-docs",
      health: "GET /health",
      auth: "/auth/*",
      test: "/test/*",
      concerts: "/concert/*",
    },
    timestamp: new Date().toISOString(),
  });
});

// 우아한 종료 처리
const gracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 ${signal} received. Starting graceful shutdown...`);

  try {
    // Redis 연결 해제
    await redisClient.disconnect();
    console.log("✅ Redis disconnected");

    // MongoDB 연결 해제
    await mongoose.connection.close();
    console.log("✅ MongoDB disconnected");

    console.log("👋 Graceful shutdown completed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during shutdown:", error);
    process.exit(1);
  }
};

// DB와 Redis 연결 후 서버 시작
Promise.all([connectMongo(), redisClient.ping()])
  .then(() => {
    app.listen(PORT, () => {
      console.log("🎉 ================================");
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
      console.log(`🎵 Concert API: http://localhost:${PORT}/concert`);
      console.log(`🔐 Auth API: http://localhost:${PORT}/auth`);
      console.log(`🧪 Test API: http://localhost:${PORT}/test`);
      console.log("🎉 ================================");
    });
  })
  .catch((err) => {
    console.error("❌ Startup failed", err);
    process.exit(1);
  });

// 우아한 종료 시그널 처리
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

// 처리되지 않은 예외 처리
process.on("uncaughtException", (error) => {
  console.error("💥 Uncaught Exception:", error);
  gracefulShutdown("uncaughtException");
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("💥 Unhandled Rejection at:", promise, "reason:", reason);
  gracefulShutdown("unhandledRejection");
});

// Redis 클라이언트를 다른 모듈에서 사용할 수 있도록 export
export { redisClient };
