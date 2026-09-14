import { Router, type IRouter } from "express";
import crmRouter from "./crm";
import conversationsRouter from "./conversations";
import campaignsRouter from "./campaigns";

const router: IRouter = Router();

router.use(crmRouter);
router.use(conversationsRouter);
router.use(campaignsRouter);

export default router;
