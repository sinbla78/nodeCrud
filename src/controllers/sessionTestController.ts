import { Request, Response } from "express";

// 세션 설정 컨트롤러
export const setSession = (req: Request, res: Response): void => {
  const { key, value } = req.body;
  
  if (!key || !value) {
    res.status(400).json({ 
      error: "key와 value가 필요합니다" 
    });
    return;
  }

  // 세션에 데이터 저장
  (req.session as any)[key] = value;
  
  res.json({
    message: "세션에 데이터가 저장되었습니다",
    sessionId: req.sessionID,
    data: { [key]: value }
  });
};

// 세션 조회 컨트롤러
export const getSession = (req: Request, res: Response): void => {
  const { key } = req.params;
  
  if (key) {
    // 특정 키 조회
    const value = (req.session as any)[key];
    res.json({
      sessionId: req.sessionID,
      key: key,
      value: value || null,
      exists: !!value
    });
  } else {
    // 전체 세션 데이터 조회
    res.json({
      sessionId: req.sessionID,
      sessionData: req.session,
      allKeys: Object.keys(req.session).filter(k => k !== 'cookie')
    });
  }
};

// 세션 삭제 컨트롤러
export const deleteSession = (req: Request, res: Response): void => {
  const { key } = req.params;
  
  if ((req.session as any)[key]) {
    delete (req.session as any)[key];
    res.json({
      message: `세션에서 '${key}' 키가 삭제되었습니다`,
      sessionId: req.sessionID
    });
  } else {
    res.status(404).json({
      error: `세션에 '${key}' 키가 존재하지 않습니다`,
      sessionId: req.sessionID
    });
  }
};

// 전체 세션 삭제 컨트롤러
export const destroySession = (req: Request, res: Response): void => {
  const sessionId = req.sessionID;
  
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({
        error: "세션 삭제 중 오류가 발생했습니다",
        details: err.message
      });
      return;
    }
    
    res.json({
      message: "세션이 완전히 삭제되었습니다",
      deletedSessionId: sessionId
    });
  });
};

// 방문 횟수 컨트롤러
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
    firstVisit: session.visitCount === 1
  });
};

// 로그인 시뮬레이션 컨트롤러
export const login = (req: Request, res: Response): void => {
  const { username } = req.body;
  
  if (!username) {
    res.status(400).json({ 
      error: "username이 필요합니다" 
    });
    return;
  }
  
  const session = req.session as any;
  session.user = {
    username,
    loginTime: new Date().toISOString(),
    isLoggedIn: true
  };
  
  res.json({
    message: "로그인 성공",
    sessionId: req.sessionID,
    user: session.user
  });
};

// 프로필 조회 컨트롤러
export const getProfile = (req: Request, res: Response): void => {
  const session = req.session as any;
  
  if (session.user && session.user.isLoggedIn) {
    res.json({
      message: "로그인된 사용자입니다",
      sessionId: req.sessionID,
      user: session.user
    });
  } else {
    res.status(401).json({
      message: "로그인이 필요합니다",
      sessionId: req.sessionID
    });
  }
};

// Redis 키 조회 컨트롤러
export const getRedisKeys = async (req: Request, res: Response): Promise<void> => {
  try {
    // Redis 클라이언트 가져오기
    const { redisClient } = require("../index");
    
    const keys = await redisClient.keys("myapp:*");
    const keyValues = [];
    
    for (const key of keys) {
      const value = await redisClient.get(key);
      keyValues.push({
        key,
        value: JSON.parse(value || '{}')
      });
    }
    
    res.json({
      message: "Redis에 저장된 세션 키들",
      totalKeys: keys.length,
      keys: keyValues
    });
  } catch (error) {
    res.status(500).json({
      error: "Redis 조회 중 오류 발생",
      details: (error as Error).message
    });
  }
};