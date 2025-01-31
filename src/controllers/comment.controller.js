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

const getVideoComments = asyncHandler(async (req, res) => {
    // Extract videoId from request params
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Validate the videoId
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "This video ID is not valid!!");
    }

    // Check if the video exists
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found!!");
    }

    // Aggregate comments with pagination
    Comment.aggregatePaginate(
        Comment.aggregate([
            {
                $match: {
                    video: new mongoose.Types.ObjectId(videoId),
                },
            },
        ]),
        { page, limit }
    ).then((result) => {
        return res.status(200).json(
            new ApiResponse(200, result, "All video comments fetched successfully")
        );
    }).catch((error) => {
        throw new ApiError(500, "Error fetching video comments");
    });
});

const updateComment = asyncHandler(async (req, res) => {
    const {newContent} = req.body
    const {commentId} = req.params

    if(!newContent || newContent?.trim() === 0){
        throw new ApiError(400, "content is required!!!")
    }
    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "comment id is not valid")
    }

    const comment = await Comment.findById(commentId)

    if(!comment){
        throw new ApiError(404, "Comment is not found!!")
    }

    if(comment?.owner.toString() !== req.user._id?.toString()){
        throw new ApiError(403, "you don't have permission to update this comment!")
    }

    const updateComment = await Comment.findByIdAndUpdate(
        commentId, 
        {
            $set: {
                content: newContent
            }
        }, 
        {
            new: true
        }
    )

    if(!updateComment){
        throw new ApiError(
            400, 
            "Something went wrong while updating the comment!!"
        )
    }

    return res
    .status(201)
    .json(new ApiResponse(200, updateComment, "Comment updated successfully:)"))
})

const deleteComment = asyncHandler( async(req,res)=>{
    // TODO: Delete a comment to Video

    const {commentId} = req.params

    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "This comment id is not valid!!")
    }

    const comment = await Comment.findById(commentId)

    if(!comment){
        throw new ApiError(404, "Comment not found!!")
    }

    if(comment?.owner?.toString() !== req.user._id?.toString()){
        throw new ApiError(500, "you don't have permission to delete this comment!!")
    }

    const deleteComment = await Comment.deleteOne({_id: commentId})

    if(!deleteComment){
        throw new ApiError(500, "Something went wrong while deleting this comment!!")
    }

    return res
    .status(201)
    .json(new ApiResponse(200, deleteComment, "Comment deleted successfully"))
})
export {
    addComment,
    getVideoComments,
    updateComment,
    deleteComment
}