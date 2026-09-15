// Vercel Node function: the whole Express app behind /api/*.
// The bundle is produced by the api-server build (esbuild).
export { default } from "../artifacts/api-server/dist/serverless.mjs";
