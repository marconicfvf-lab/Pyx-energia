import { Router, type IRouter } from "express";
import healthRouter from "./health";
import chatRouter from "./chat";
import whatsappRouter from "./whatsapp";
import cronRouter from "./cron";

const publicRouter: IRouter = Router();

publicRouter.use(healthRouter);
publicRouter.use(chatRouter);
publicRouter.use(whatsappRouter);
publicRouter.use(cronRouter);

export default publicRouter;
