import {Router} from "express"
import {
    toggleCommentLikeAndUnlike,
    toggleTweetLikeAndUnlike,
    toggleVideoLikeAndUnlike,
    getLikedVideos

} from "../controllers/like.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { getAllVideo } from "../controllers/video.controller.js"

const router = Router()
router.use(verifyJWT)  // Apply verifyJWT middleware to all routes in this file

router.route("/toggle/v/:videoId").post(toggleVideoLikeAndUnlike)
router.route("/toggle/c/:commentId").post(toggleCommentLikeAndUnlike)
router.route("/toggle/t/:tweetId").post(toggleTweetLikeAndUnlike)
router.route("getAllVideos").get(getLikedVideos)
export default router