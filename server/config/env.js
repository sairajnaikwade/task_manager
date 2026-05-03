import dotenv from "dotenv";
dotenv.config();

const required = ["DATABASE_URL", "JWT_SECRET"];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  PORT: parseInt(process.env.PORT ?? "3000"),
  NODE_ENV: process.env.NODE_ENV ?? "development",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "7d",
};
