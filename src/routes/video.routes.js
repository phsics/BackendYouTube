import {Router} from "express"

import {
    publishAVideo,
    updateVideo,
    getVideoById,
    getAllVideo
} from "../controllers/video.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"
import { get } from "mongoose"

const router = Router()
router.use(verifyJWT)  // Apply verifyJWT middleware to all routes in this file

router
    .route("/publish")
    .post(upload.fields([
        {
            name: "videoFile", 
            maxCount: 1
        }, 
        {
            name: "thumbnail", 
            maxCount: 1
        }
    ]),
    publishAVideo
)

router.route("/:videoId").patch(upload.single("thumbnail"),updateVideo)
router.route("/:videoId").get(getVideoById)
router.route("/getAllVideos").get(getAllVideo)
export default router