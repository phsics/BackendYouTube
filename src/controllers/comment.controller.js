import mongoose, {isValidObjectId} from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Video} from "../models/video.model.js"

const addComment = asyncHandler(async (req,res) => {
    // TODO: add a comment to a video

    const {comment} = req.body
    const {videoId} = req.params

    if(!comment || comment?.trim() === ""){
        throw new ApiError(400, "Comment is required")
    }

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "This video id is not valid!!")
    }

    // save in db and create all the fields
    const videoComment = await Comment.create({
        content: comment,
        video: videoId, 
        owner: req.user._id
    })

    if(!videoComment){
        throw new ApiError(500, "Something went wrong while creating video comment")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(200, videoComment, "video comment created successfully!!")
    )
})

export {
    addComment
}