import session from "express-session";

declare module "express-session" {
  interface SessionData {
    user?: {
      username: string;
      userId: string;
      loginTime: string;
    };
  }
}
