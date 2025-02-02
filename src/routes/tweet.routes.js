import {Router} from "express"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { createTweet, deleteTweet, getUserTweets, updateTweet } from "../controllers/tweet.controller.js"

const router = Router()
router.use(verifyJWT)  // Apply verifyJWT middleware to all routes in this file

router.route("/createTweet").post(createTweet)
router.route("/getTweets/:userId").get(getUserTweets)
router.route("/updateTweet/:tweetId").patch(updateTweet)
router.route("/deleteTweet/:tweetId").delete(deleteTweet)
export default router