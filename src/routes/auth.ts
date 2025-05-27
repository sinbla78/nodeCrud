import express from "express";
import {
  register,
  login,
  logout,
  checkSession,
} from "../controllers/authController";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/check-session", checkSession);

export default router;
