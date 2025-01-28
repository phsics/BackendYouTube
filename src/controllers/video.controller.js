import mongoose, {isValidObjectId, mongo} from "mongoose";

import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {deleteOnCloudinary, uploadOnCloudinary} from "../utils/cloudinary.js"

const publishAVideo = asyncHandler(async(req, res) => {
    // TODO: get video, upload to cloudinary, create video

    const {title, description, isPublished = true} = req.body

    if(!title || title?.trim() ===""){
        throw new ApiError(400, "title content is required!!!")
    }

    if(!description || description?.trim() === ""){
        throw new ApiError(400, "Description is required!!")
    }
    console.log(req.files)

    const videoFileLocalPath = req.files?.videoFile?.[0].path
    const thumbnailFileLocalPath = req.files?.thumbnail?.[0].path

    if(!videoFileLocalPath){
        throw new ApiError(400, "Video file is missing!!")
    }

    // upload on Cloudinary
    const videoFile = await uploadOnCloudinary(videoFileLocalPath)
    const thumbnailFile = await uploadOnCloudinary(thumbnailFileLocalPath)

    if(!videoFile){
        throw new ApiError(500, "something went wrong while uploading video file on cloudinary")
    }

    // save in db
    const video = await Video.create({
        videoFile: {
            public_id: videoFile?.public_id, 
            url: videoFile?.url
        }, 
        thumbnail: {
            public_id: thumbnailFile?.public_id,
            url: thumbnailFile?.url
        }, 
        title, 
        description, 
        isPublished,
        videoOwner: req.user_id,
        duration: videoFile?.duration,
    })

    if(!video){
        throw new ApiError(500, "something went wrong while storing video in database")
    }

    return res
    .status(201)
    .json(new ApiResponse(200, video, "video uploaded successfully"))
})

const updateVideo = asyncHandler(async (req,res) => {
    // TODO: update video details like title, description, thumbnail
    const {videoId} = req.params
    const {title, description} = req.body
    const thumbnailFile = req.file?.path

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "this video id is not valid")
    }

    // if any field is not provided

    if(!thumbnailFile){
        throw new ApiError(400, "update fields are required!")
    }
    else if(!title || title?.trim() === ""){
        throw new ApiError(400, "update fields are required!") 
    }
    else if(!description || description?.trim() === ""){
        throw new ApiError(400, "update fields are required!")
    }

    // find video 
    const previousVideo = await Video.findOne({
        _id: videoId
    })

    if(!previousVideo){
        throw new ApiError(404, "video not found!")
    }

    let updateFields = {
        $set: {
            title, 
            description
        }
    }

    // if thumbnail provided delete the previous one and upload new one 

    let thumbnailUploadOnCloudinary

    if(thumbnailFile){
        await deleteOnCloudinary(previousVideo?.thumbnail?.public_id)
    }

    thumbnailUploadOnCloudinary = await uploadOnCloudinary(thumbnailFile)

    if(!thumbnailUploadOnCloudinary){
        throw new ApiError(
            500, 
            "something went wrong while uploading the thumbnail file on cloudinary!!"
        )
    }
    updateFields.$set = {
        public_id: thumbnailUploadOnCloudinary?.public_id,
        url: thumbnailUploadOnCloudinary?.url
    }

    // save in db
    const updateDetails = await Video.findByIdAndUpdate(videoId, updateFields, {new: true})

    if(!updateDetails){
        throw new ApiError(500, "Something went wrong while updating video details")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(200, {updateDetails}, "Video details update successfully!")
    )

})

const getVideoById = asyncHandler(async (req,res) => {
    // TODO: get video by id

    const {videoId} = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "this video id is not valid !!")
    }

    const video = await Video.findById({
        _id: videoId,
    })

    if(!video){
        throw new ApiError(404, "Video is not found!!")
    }

    return res
    .status(201)
    .json(new ApiResponse(200, video, "video fetched successfully!"))
})

const getAllVideo = asyncHandler(async(req, res) => {
    // TODO: get all videos based on query, sort, pagination
    // If 'pages' exists in req.query, its value is assigned to the 'page' variable.
    // If it doesn't exist, 'page' is assigned a default value of 1.

    // If 'limit' exists in req.query, its value is assigned to the 'limit' variable.
    // If it doesn't exist, 'limit' is assigned a default value of 1. 

    // similarly for query, sortBy, sortType
   const {
    page = 1, 
    limit = 10, 
    query = '/^video/', 
    sortBy = "createdAt", 
    sortType = req.query.sortType ? parseInt(req.query.sortType) : 1,
    userId = req.user._id, 
    } = req.query

    // find user in db
    const user = await Video.findById({
        _id: userId,
    })

    if(!user){
        throw new ApiError(404, "User not found!!")
    }

    // This is a MongoDB aggregation pipeline that is used to fetch video based on certain criteria

    const getAllVideoAggregate = await Video.aggregate([
        {
            // The $match stage filters the documents to pass only the documents that match the specified conditions to the next pipeline stage.
            $match: {
                // This line matches videos where videoOwner field is equal to the userId
                videoOwner: new mongoose.Types.ObjectId(userId), 
                // This line matches videos where the title or description fields contain the query string

                $or: [
                    {
                        title: {$regex: query, $options: "i"}, 
                    }, 
                    {
                        description: {$regex: query, $options: "i"}, 
                    }
                ]
            }
        },
        {
            // The $sort stage sorts the documents. The sort order is determined by the value of 'sortBy' and 'sortType'
            $sort: {
                [sortBy]: sortType
            }
        },
        {
            // The $skip stage skips a specified number of documents. It is used here for pagination.
            $skip: (page-1)*limit
        }, 
        {
            // The $limit stage limits the number of documents in the aggregation pipeline. It is used here for pagination.
            $limit: parseInt(limit)
        }
    ])

    // This line paginates the results of the aggregation
    Video.aggregatePaginate(getAllVideoAggregate, {page, limit})
    .then((result) => {
        // If the aggregation and pagination are successful, a 200 status code and the results are returned
        return res
        .status(201)
        .json(new ApiResponse(200, result, "Fetched all videos successfully!!"))
    })
    .catch((error) => {
        // If there is an error during the aggregation or pagination, the error is logged and thrown
        console.log("getting error while fetching all videos", error)
        throw error
    })
})

const deleteVideo = asyncHandler(async(req,res) => {
    // Extract the videoId from the request paramters
    const {videoId} = req.params

    // Check if the videoId is a valid MongoDB objectId. If it's not, throw an error.
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "this video id is not valid")
    }

    // Find the video in the database using the videoId. If the video is not found then return error

    const video = await Video.findById(videoId)({
        _id: video
    })
})
export {
    publishAVideo,
    updateVideo,
    getVideoById,
    getAllVideo
}
