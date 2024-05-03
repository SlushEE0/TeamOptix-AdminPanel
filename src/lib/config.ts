export const BASE_FETCH_URL = process.env.BACKEND_URL;
export const FIREBASE_CONFIG = JSON.parse(process.env.FIREBASE_CONFIG || "");
export const MONGO_URL = process.env.MONGO_URL;

export const ADMIN_CREDENTIALS = {
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID
};
