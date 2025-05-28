import { Request, Response } from "express";

/**
 * @swagger
 * /test/session:
 *   post:
 *     summary: 세션에 데이터 저장
 *     description: Redis 세션에 키-값 데이터를 저장합니다.
 *     tags: [Test]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *               - value
 *             properties:
 *               key:
 *                 type: string
 *                 description: 세션에 저장할 키
 *                 example: "userName"
 *               value:
 *                 type: string
 *                 description: 세션에 저장할 값
 *                 example: "홍길동"
 *     responses:
 *       200:
 *         description: 세션 데이터 저장 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "세션에 데이터가 저장되었습니다"
 *                 sessionId:
 *                   type: string
 *                   description: Redis 세션 ID
 *                   example: "s:abc123def456.xyz789"
 *                 data:
 *                   type: object
 *                   description: 저장된 데이터
 *                   example: { "userName": "홍길동" }
 *       400:
 *         description: 잘못된 요청 데이터
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "key와 value가 필요합니다"
 */
export const setSession = (req: Request, res: Response): void => {
  const { key, value } = req.body;

  if (!key || !value) {
    res.status(400).json({
      error: "key와 value가 필요합니다",
    });
    return;
  }

  // 세션에 데이터 저장
  (req.session as any)[key] = value;

  res.json({
    message: "세션에 데이터가 저장되었습니다",
    sessionId: req.sessionID,
    data: { [key]: value },
  });
};

/**
 * @swagger
 * /test/session/{key}:
 *   get:
 *     summary: 세션 데이터 조회
 *     description: 특정 키의 세션 데이터를 조회하거나, 키가 없으면 전체 세션 데이터를 조회합니다.
 *     tags: [Test]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: false
 *         schema:
 *           type: string
 *         description: 조회할 세션 키 (없으면 전체 조회)
 *         example: "userName"
 *     responses:
 *       200:
 *         description: 세션 데이터 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   description: 특정 키 조회 결과
 *                   properties:
 *                     sessionId:
 *                       type: string
 *                       example: "s:abc123def456.xyz789"
 *                     key:
 *                       type: string
 *                       example: "userName"
 *                     value:
 *                       type: string
 *                       example: "홍길동"
 *                     exists:
 *                       type: boolean
 *                       example: true
 *                 - type: object
 *                   description: 전체 세션 조회 결과
 *                   properties:
 *                     sessionId:
 *                       type: string
 *                       example: "s:abc123def456.xyz789"
 *                     sessionData:
 *                       type: object
 *                       description: 전체 세션 데이터
 *                     allKeys:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: 세션의 모든 키 목록
 *                       example: ["userName", "visitCount"]
 */
export const getSession = (req: Request, res: Response): void => {
  const { key } = req.params;

  if (key) {
    // 특정 키 조회
    const value = (req.session as any)[key];
    res.json({
      sessionId: req.sessionID,
      key: key,
      value: value || null,
      exists: !!value,
    });
  } else {
    // 전체 세션 데이터 조회
    res.json({
      sessionId: req.sessionID,
      sessionData: req.session,
      allKeys: Object.keys(req.session).filter((k) => k !== "cookie"),
    });
  }
};

/**
 * @swagger
 * /test/session/{key}:
 *   delete:
 *     summary: 세션 데이터 삭제
 *     description: 특정 키의 세션 데이터를 삭제합니다.
 *     tags: [Test]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: 삭제할 세션 키
 *         example: "userName"
 *     responses:
 *       200:
 *         description: 세션 데이터 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "세션에서 'userName' 키가 삭제되었습니다"
 *                 sessionId:
 *                   type: string
 *                   example: "s:abc123def456.xyz789"
 *       404:
 *         description: 삭제할 키가 존재하지 않음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "세션에 'userName' 키가 존재하지 않습니다"
 *                 sessionId:
 *                   type: string
 *                   example: "s:abc123def456.xyz789"
 */
export const deleteSession = (req: Request, res: Response): void => {
  const { key } = req.params;

  if ((req.session as any)[key]) {
    delete (req.session as any)[key];
    res.json({
      message: `세션에서 '${key}' 키가 삭제되었습니다`,
      sessionId: req.sessionID,
    });
  } else {
    res.status(404).json({
      error: `세션에 '${key}' 키가 존재하지 않습니다`,
      sessionId: req.sessionID,
    });
  }
};

/**
 * @swagger
 * /test/session/destroy:
 *   post:
 *     summary: 전체 세션 삭제
 *     description: 현재 사용자의 전체 세션을 Redis에서 완전히 삭제합니다.
 *     tags: [Test]
 *     responses:
 *       200:
 *         description: 세션 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "세션이 완전히 삭제되었습니다"
 *                 deletedSessionId:
 *                   type: string
 *                   description: 삭제된 세션 ID
 *                   example: "s:abc123def456.xyz789"
 *       500:
 *         description: 세션 삭제 실패
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "세션 삭제 중 오류가 발생했습니다"
 *                 details:
 *                   type: string
 *                   description: 상세 에러 메시지
 */
export const destroySession = (req: Request, res: Response): void => {
  const sessionId = req.sessionID;

  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({
        error: "세션 삭제 중 오류가 발생했습니다",
        details: err.message,
      });
      return;
    }

    res.json({
      message: "세션이 완전히 삭제되었습니다",
      deletedSessionId: sessionId,
    });
  });
};

/**
 * @swagger
 * /test/visit:
 *   get:
 *     summary: 방문 횟수 증가 및 조회
 *     description: 세션에 저장된 방문 횟수를 증가시키고 현재 카운트를 반환합니다.
 *     tags: [Test]
 *     responses:
 *       200:
 *         description: 방문 횟수 업데이트 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "방문 횟수가 업데이트되었습니다"
 *                 sessionId:
 *                   type: string
 *                   example: "s:abc123def456.xyz789"
 *                 visitCount:
 *                   type: number
 *                   description: 현재 방문 횟수
 *                   example: 5
 *                 firstVisit:
 *                   type: boolean
 *                   description: 첫 방문 여부
 *                   example: false
 */
export const getVisitCount = (req: Request, res: Response): void => {
  const session = req.session as any;

  if (session.visitCount) {
    session.visitCount++;
  } else {
    session.visitCount = 1;
  }

  res.json({
    message: "방문 횟수가 업데이트되었습니다",
    sessionId: req.sessionID,
    visitCount: session.visitCount,
    firstVisit: session.visitCount === 1,
  });
};

/**
 * @swagger
 * /test/login:
 *   post:
 *     summary: 로그인 시뮬레이션
 *     description: 사용자명을 받아 세션에 로그인 정보를 저장합니다. (실제 인증 없는 테스트용)
 *     tags: [Test]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *             properties:
 *               username:
 *                 type: string
 *                 description: 사용자명
 *                 example: "testuser"
 *     responses:
 *       200:
 *         description: 로그인 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "로그인 성공"
 *                 sessionId:
 *                   type: string
 *                   example: "s:abc123def456.xyz789"
 *                 user:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                       example: "testuser"
 *                     loginTime:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T10:30:00.000Z"
 *                     isLoggedIn:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: 잘못된 요청 데이터
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "username이 필요합니다"
 */
export const login = (req: Request, res: Response): void => {
  const { username } = req.body;

  if (!username) {
    res.status(400).json({
      error: "username이 필요합니다",
    });
    return;
  }

  const session = req.session as any;
  session.user = {
    username,
    loginTime: new Date().toISOString(),
    isLoggedIn: true,
  };

  res.json({
    message: "로그인 성공",
    sessionId: req.sessionID,
    user: session.user,
  });
};

/**
 * @swagger
 * /test/profile:
 *   get:
 *     summary: 프로필 조회 (로그인 상태 확인)
 *     description: 세션에 저장된 사용자 정보를 조회합니다. 로그인되지 않은 경우 401 에러를 반환합니다.
 *     tags: [Test]
 *     responses:
 *       200:
 *         description: 로그인된 사용자 정보 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "로그인된 사용자입니다"
 *                 sessionId:
 *                   type: string
 *                   example: "s:abc123def456.xyz789"
 *                 user:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                       example: "testuser"
 *                     loginTime:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T10:30:00.000Z"
 *                     isLoggedIn:
 *                       type: boolean
 *                       example: true
 *       401:
 *         description: 로그인이 필요함
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "로그인이 필요합니다"
 *                 sessionId:
 *                   type: string
 *                   example: "s:abc123def456.xyz789"
 */
export const getProfile = (req: Request, res: Response): void => {
  const session = req.session as any;

  if (session.user && session.user.isLoggedIn) {
    res.json({
      message: "로그인된 사용자입니다",
      sessionId: req.sessionID,
      user: session.user,
    });
  } else {
    res.status(401).json({
      message: "로그인이 필요합니다",
      sessionId: req.sessionID,
    });
  }
};

/**
 * @swagger
 * /test/redis-keys:
 *   get:
 *     summary: Redis 세션 키 조회
 *     description: Redis에 저장된 모든 세션 키와 값을 조회합니다. (개발/디버깅용)
 *     tags: [Test]
 *     responses:
 *       200:
 *         description: Redis 키 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Redis에 저장된 세션 키들"
 *                 totalKeys:
 *                   type: number
 *                   description: 총 키 개수
 *                   example: 3
 *                 keys:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       key:
 *                         type: string
 *                         description: Redis 키
 *                         example: "myapp:sess:abc123def456"
 *                       value:
 *                         type: object
 *                         description: 세션 데이터
 *                         example: { "user": { "username": "testuser", "isLoggedIn": true } }
 *       500:
 *         description: Redis 조회 실패
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Redis 조회 중 오류 발생"
 *                 details:
 *                   type: string
 *                   description: 상세 에러 메시지
 */
export const getRedisKeys = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Redis 클라이언트 가져오기
    const { redisClient } = require("../index");

    const keys = await redisClient.keys("myapp:*");
    const keyValues = [];

    for (const key of keys) {
      const value = await redisClient.get(key);
      keyValues.push({
        key,
        value: JSON.parse(value || "{}"),
      });
    }

    res.json({
      message: "Redis에 저장된 세션 키들",
      totalKeys: keys.length,
      keys: keyValues,
    });
  } catch (error) {
    res.status(500).json({
      error: "Redis 조회 중 오류 발생",
      details: (error as Error).message,
    });
  }
};
