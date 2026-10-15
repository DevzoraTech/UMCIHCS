import { betterAuth } from "better-auth";
import { getPool } from "@/infrastructure/database/pool";

export const auth = betterAuth({
  appName: "UMCIHCS Portal",
  database: getPool(),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: ["https://umcihcs.antikra.com", "http://localhost:3000", "http://127.0.0.1:3000"],
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
    revokeSessionsOnPasswordReset: true,
  },
  user: {
    additionalFields: {
      role: { type: "string", required: true, defaultValue: "viewer", input: false },
    },
  },
  session: { expiresIn: 60 * 60 * 8, updateAge: 60 * 30 },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 60,
    customRules: { "/sign-in/email": { window: 60, max: 5 } },
  },
  advanced: { database: { joins: true, validateSchema: false }, useSecureCookies: process.env.NODE_ENV === "production" },
  telemetry: { enabled: false },
});
