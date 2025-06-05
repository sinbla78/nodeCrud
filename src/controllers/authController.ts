import express from "express";
import bcrypt from "bcrypt";
import { User } from "../models/user";

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: 사용자 회원가입
 *     description: 새로운 사용자를 MongoDB에 등록합니다..
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *       400:
 *         description: 잘못된 요청
 *       500:
 *         description: 서버 에러
 */
export const register = async (req: express.Request, res: express.Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ message: "username과 password를 입력해주세요." });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ message: "비밀번호는 최소 6자 이상이어야 합니다." });
    return;
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      res.status(400).json({ message: "이미 존재하는 사용자입니다." });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const newUser = new User({
      username,
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await newUser.save();

    console.log(`새 사용자 가입: ${username} (MongoDB 저장 완료)`);
    res.status(201).json({
      message: "회원가입 성공",
      user: { username, createdAt: newUser.createdAt },
    });
  } catch (error) {
    console.error("회원가입 에러:", error);
    res.status(500).json({ message: "서버 에러로 회원가입 실패" });
  }
};

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: 사용자 로그인
 *     description: 사용자 인증 후 Redis에 세션을 저장합니다.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: 로그인 성공
 *       400:
 *         description: 요청 오류
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 에러
 */
export const login = async (req: express.Request, res: express.Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ message: "username과 password를 입력해주세요." });
    return;
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      res.status(401).json({ message: "존재하지 않는 사용자입니다." });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
      return;
    }

    await User.findByIdAndUpdate(user._id, { updatedAt: new Date() });

    req.session.user = {
      username,
      userId: user._id.toString(),
      loginTime: new Date().toISOString(),
    };

    console.log(
      `로그인 성공: ${username} (세션 ID: ${req.sessionID}, Redis 저장 완료)`
    );
    res.status(200).json({
      message: "로그인 성공",
      user: { username },
      sessionId: req.sessionID,
    });
  } catch (error) {
    console.error("로그인 에러:", error);
    res.status(500).json({ message: "서버 에러로 로그인 실패" });
  }
};

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: 로그아웃
 *     description: Redis에서 세션을 삭제하고 로그아웃합니다.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: 로그아웃 성공
 *       500:
 *         description: 로그아웃 실패
 */
export const logout = (req: express.Request, res: express.Response) => {
  const sessionId = req.sessionID;
  const username = req.session.user?.username;

  req.session.destroy((err) => {
    if (err) {
      console.error("로그아웃 에러:", err);
      res.status(500).json({ message: "로그아웃 실패" });
      return;
    }

    res.clearCookie("connect.sid");

    console.log(
      `로그아웃 완료: ${username} (세션 ID: ${sessionId}, Redis에서 삭제 완료)`
    );
    res.status(200).json({
      message: "로그아웃 성공",
      deletedSessionId: sessionId,
    });
  });
};

/**
 * @swagger
 * /auth/session:
 *   get:
 *     summary: 로그인 상태 확인
 *     description: Redis 세션을 통해 로그인 여부를 확인합니다.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: 로그인 상태 반환
 */
export const checkSession = (req: express.Request, res: express.Response) => {
  if (req.session.user) {
    res.status(200).json({
      loggedIn: true,
      user: req.session.user,
      sessionId: req.sessionID,
      storage: "세션은 Redis에 저장됨",
    });
  } else {
    res.status(200).json({
      loggedIn: false,
      sessionId: req.sessionID,
    });
  }
};

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: 사용자 프로필 조회
 *     description: 로그인된 사용자의 MongoDB 프로필 정보를 조회합니다.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: 프로필 조회 성공
 *       401:
 *         description: 인증 필요
 *       404:
 *         description: 사용자 없음
 *       500:
 *         description: 서버 에러
 */
export const getProfile = async (
  req: express.Request,
  res: express.Response
) => {
  if (!req.session.user) {
    res.status(401).json({ message: "로그인이 필요합니다." });
    return;
  }

  try {
    const user = await User.findOne({
      username: req.session.user.username,
    }).select("-passwordHash");

    if (!user) {
      res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
      return;
    }

    res.status(200).json({
      message: "프로필 조회 성공",
      user: {
        username: user.username,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      session: req.session.user,
      dataSource: "사용자 정보는 MongoDB에서 조회, 세션은 Redis에서 확인",
    });
  } catch (error) {
    console.error("프로필 조회 에러:", error);
    res.status(500).json({ message: "프로필 조회 실패" });
  }
};

/**
 * @swagger
 * /auth/users:
 *   get:
 *     summary: 전체 사용자 목록 조회 (관리자용)
 *     description: 모든 사용자 정보를 MongoDB에서 조회합니다.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: 사용자 목록 조회 성공
 *       500:
 *         description: 서버 에러
 */
export const getAllUsers = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const users = await User.find({})
      .select("-passwordHash")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "사용자 목록 조회 성공",
      totalUsers: users.length,
      users,
      dataSource: "MongoDB에서 조회",
    });
  } catch (error) {
    console.error("사용자 목록 조회 에러:", error);
    res.status(500).json({ message: "사용자 목록 조회 실패" });
  }
};
