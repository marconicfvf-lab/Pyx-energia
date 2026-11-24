import path from "node:path";
import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { clerkMiddleware } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";
import {
  CLERK_PROXY_PATH,
  clerkProxyMiddleware,
  getClerkProxyHost,
} from "./middlewares/clerkProxyMiddleware";
import router from "./routes";
import publicRouter from "./routes/public";
import { env } from "./lib/env";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// Clerk Frontend API requests must be proxied before body parsers so raw
// callback/request bodies are preserved.
app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", publicRouter);

app.use(
  clerkMiddleware((req) => ({
    publishableKey: publishableKeyFromHost(
      getClerkProxyHost(req) ?? "",
      process.env.CLERK_PUBLISHABLE_KEY,
    ),
  })),
);

app.use("/api", router);

if (env.staticDir) {
  const staticDir = path.resolve(env.staticDir);
  const prerendered: Record<string, string> = {
    "/": "index.html",
    "/empresas": "empresas/index.html",
    "/privacidade": "privacidade/index.html",
    "/energia-solar-por-assinatura": "energia-solar-por-assinatura/index.html",
    "/recife": "recife/index.html",
    "/fortaleza": "fortaleza/index.html",
  };
  app.use(express.static(staticDir));
  app.get(/^(?!\/api\/).*/, (req, res) => {
    const pathname = req.path.replace(/\/+$/, "") || "/";
    const isAuth =
      pathname === "/painel" ||
      pathname.startsWith("/painel/") ||
      pathname === "/sign-in" ||
      pathname.startsWith("/sign-in/") ||
      pathname === "/sign-up" ||
      pathname.startsWith("/sign-up/");
    if (isAuth) {
      res.sendFile(path.join(staticDir, "spa.html"));
      return;
    }
    const page = prerendered[pathname];
    if (page) {
      res.sendFile(path.join(staticDir, page));
      return;
    }
    res.status(404).sendFile(path.join(staticDir, "404.html"));
  });
}

export default app;
