import {Router} from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import {
    addComment,
    deleteComment,
    getVideoComments, 
    updateComment
}
from "../controllers/comment.controller.js"

const router = Router()

router.use(verifyJWT)  // Apply verifyJWT middleware to all routes in this file

router.route("/:videoId").post(addComment)
router.route("/c/:videoId").get(getVideoComments)
router.route("/video/updateComment/:commentId").patch(updateComment)
router.route("/video/deleteComment/:commentId").delete(deleteComment)
export default router