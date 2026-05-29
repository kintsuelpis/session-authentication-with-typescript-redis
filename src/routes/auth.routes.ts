import { Router } from "express";
import { registrationController, loginController } from "../controllers/auth.controller.js";

const router = Router()

router.post('/register',registrationController)
router.post('/login',loginController)

export default router