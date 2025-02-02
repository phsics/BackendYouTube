import {Router} from "express"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { createPlaylist, deletePlaylist, getPlaylistById, updatePlaylist } from "../controllers/playlist.controller.js"

const router = Router()
router.use(verifyJWT)   // Apply verifyJWT middleware to all routes in this file

router.route("/createPlaylist").post(createPlaylist)
router
    .route("/:playlistId")
    .get(getPlaylistById)
    .patch(updatePlaylist)
    .delete(deletePlaylist)
    
export default router