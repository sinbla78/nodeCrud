import express from "express";
import bcrypt from "bcrypt";
import { User } from "../models/user";

// 회원가입 - MongoDB에 사용자 저장
export const register = async (req: express.Request, res: express.Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ message: "username과 password를 입력해주세요." });
    return;
  }

  // 패스워드 강도 검증 (선택사항)
  if (password.length < 6) {
    res.status(400).json({ message: "비밀번호는 최소 6자 이상이어야 합니다." });
    return;
  }

  try {
    // MongoDB에서 기존 사용자 확인
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      res.status(400).json({ message: "이미 존재하는 사용자입니다." });
      return;
    }

    // 비밀번호 해시화 후 MongoDB에 저장
    const passwordHash = await bcrypt.hash(password, 12); // salt rounds 증가
    const newUser = new User({ 
      username, 
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await newUser.save();

    console.log(`새 사용자 가입: ${username} (MongoDB 저장 완료)`);
    res.status(201).json({ 
      message: "회원가입 성공",
      user: { username, createdAt: newUser.createdAt }
    });
  } catch (error) {
    console.error('회원가입 에러:', error);
    res.status(500).json({ message: "서버 에러로 회원가입 실패" });
  }
};

// 로그인 - MongoDB에서 사용자 확인 후 Redis에 세션 저장
export const login = async (req: express.Request, res: express.Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ message: "username과 password를 입력해주세요." });
    return;
  }

  try {
    // MongoDB에서 사용자 조회
    const user = await User.findOne({ username });
    if (!user) {
      res.status(401).json({ message: "존재하지 않는 사용자입니다." });
      return;
    }

    // 비밀번호 검증
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
      return;
    }

    // 로그인 시간 업데이트 (MongoDB)
    await User.findByIdAndUpdate(user._id, { updatedAt: new Date() });

    // Redis에 세션 저장
    req.session.user = { 
      username,
      userId: user._id.toString(),
      loginTime: new Date().toISOString()
    };

    console.log(`로그인 성공: ${username} (세션 ID: ${req.sessionID}, Redis 저장 완료)`);
    res.status(200).json({ 
      message: "로그인 성공",
      user: { username },
      sessionId: req.sessionID
    });
  } catch (error) {
    console.error('로그인 에러:', error);
    res.status(500).json({ message: "서버 에러로 로그인 실패" });
  }
};

// 로그아웃 - Redis에서 세션 삭제
export const logout = (req: express.Request, res: express.Response) => {
  const sessionId = req.sessionID;
  const username = req.session.user?.username;

  req.session.destroy((err) => {
    if (err) {
      console.error('로그아웃 에러:', err);
      res.status(500).json({ message: "로그아웃 실패" });
      return;
    }
    
    // 클라이언트 쿠키 삭제
    res.clearCookie("connect.sid");
    
    console.log(`로그아웃 완료: ${username} (세션 ID: ${sessionId}, Redis에서 삭제 완료)`);
    res.status(200).json({ 
      message: "로그아웃 성공",
      deletedSessionId: sessionId
    });
  });
};

// 로그인 상태 확인 - Redis에서 세션 확인
export const checkSession = (req: express.Request, res: express.Response) => {
  if (req.session.user) {
    res.status(200).json({ 
      loggedIn: true, 
      user: req.session.user,
      sessionId: req.sessionID,
      storage: "세션은 Redis에 저장됨"
    });
  } else {
    res.status(200).json({ 
      loggedIn: false,
      sessionId: req.sessionID 
    });
  }
};

// 사용자 프로필 조회 - MongoDB에서 최신 정보 조회
export const getProfile = async (req: express.Request, res: express.Response) => {
  if (!req.session.user) {
    res.status(401).json({ message: "로그인이 필요합니다." });
    return;
  }

  try {
    // MongoDB에서 최신 사용자 정보 조회
    const user = await User.findOne({ username: req.session.user.username })
      .select('-passwordHash'); // 비밀번호 해시 제외

    if (!user) {
      res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
      return;
    }

    res.status(200).json({
      message: "프로필 조회 성공",
      user: {
        username: user.username,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      session: req.session.user,
      dataSource: "사용자 정보는 MongoDB에서 조회, 세션은 Redis에서 확인"
    });
  } catch (error) {
    console.error('프로필 조회 에러:', error);
    res.status(500).json({ message: "프로필 조회 실패" });
  }
};

// 모든 사용자 목록 조회 (관리자용) - MongoDB에서 조회
export const getAllUsers = async (req: express.Request, res: express.Response) => {
  try {
    const users = await User.find({})
      .select('-passwordHash') // 비밀번호 해시 제외
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "사용자 목록 조회 성공",
      totalUsers: users.length,
      users,
      dataSource: "MongoDB에서 조회"
    });
  } catch (error) {
    console.error('사용자 목록 조회 에러:', error);
    res.status(500).json({ message: "사용자 목록 조회 실패" });
  }
};