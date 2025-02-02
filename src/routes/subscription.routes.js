import {Router} from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels } from "../controllers/subscription.controller.js"

const router = Router()
router.use(verifyJWT) // Apply verifyJWT middleware to all routes in this file

router.route("/toggleSubscription/:channelId").post(toggleSubscription)
router.route("/getUserChannelSubscribers/:channelId").get(getUserChannelSubscribers)
router.route("/getSubscribedChannel/:channelId").get(getSubscribedChannels)
export default router