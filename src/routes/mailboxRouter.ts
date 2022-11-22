import {Router} from "express";
import {mailboxController} from "../controllers/mailboxController";

export const mailboxRouter = Router();

mailboxRouter.get('/', mailboxController);