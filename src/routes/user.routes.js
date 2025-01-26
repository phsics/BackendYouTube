import { Router } from "express";
import { 
    loginUser, 
    logoutUser, 
    registerUser, 
    refreshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser ,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
} from "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middleware.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router()

// working
router.route("/register").post(
    upload.fields([
        {
            name: "avatar", 
            maxCount: 1
        }, 
        {
            name: "coverImage",
            maxCount: 1
        }
    ]), 
    registerUser
)

// working
router.route("/login").post(loginUser)

// secured routes

// working
router.route("/logout").post(verifyJWT, logoutUser)

// working
router.route("/refresh-token").post(refreshAccessToken)

// working
router.route("/change-password").post(verifyJWT, changeCurrentPassword)

// working
router.route("/current-user").get(verifyJWT, getCurrentUser)

// working
router.route("/update-account").patch(verifyJWT, updateAccountDetails)

// working
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)

// working
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)

// working
router.route("/c/:username").get(verifyJWT, getUserChannelProfile)

// working
router.route("/history").get(verifyJWT, getWatchHistory)

export default router;