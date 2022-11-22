import {Router} from "express";
import {loginController} from "../controllers/loginController";


export const loginRouter = Router();

loginRouter.post('/',loginController);