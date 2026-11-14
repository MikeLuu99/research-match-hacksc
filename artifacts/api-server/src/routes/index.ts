import { Router, type IRouter } from "express";
import healthRouter from "./health";
import researchmatchRouter from "./researchmatch";

const router: IRouter = Router();

router.use(healthRouter);
router.use(researchmatchRouter);

export default router;
