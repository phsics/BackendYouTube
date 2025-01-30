import {Router} from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import {
    addComment
}
from "../controllers/comment.controller.js"

const router = Router()

router.use(verifyJWT)  // Apply verifyJWT middleware to all routes in this file

router.route("/:videoId").post(addComment)
export default router