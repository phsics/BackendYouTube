import {Router} from "express"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router()
router.use(verifyJWT)  // Apply verifyJWT middleware to all routes in this file



export default router