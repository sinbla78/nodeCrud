import express from "express";
import {
  setSession,
  getSession,
  deleteSession,
  destroySession,
  getVisitCount,
  login,
  getProfile,
  getRedisKeys
} from "../controllers/sessionTestController";

const router = express.Router();

// 세션 관련 라우트
router.post("/set-session", setSession);
router.get("/get-session/:key?", getSession);
router.delete("/delete-session/:key", deleteSession);
router.delete("/destroy-session", destroySession);

// 기능 테스트 라우트
router.get("/visit-count", getVisitCount);
router.post("/login", login);
router.get("/profile", getProfile);

// 디버깅 라우트
router.get("/redis-keys", getRedisKeys);

export default router;