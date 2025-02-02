import mongoose, { Mongoose } from "mongoose";
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js";

// TODO: Get the channel stats like total video views, total subscribers, total videos, total likes, etc.

const getChannelStats = asyncHandler(async(req, res) => {
    // total likes 

    const allLikes = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user._id)   // Matching likes by the current user
            }
        }, 
        {
            $group: {
                _id: null, 
                totalVideoLikes: {
                    $sum: {
                        $cond: [{$ifNull: ["$video", false]}, 1, 0]   // not null then add 1 else 0 
                    }
                },
                totalTweetLikes: {
                    $sum: {
                        $cond: [{$ifNull: ["$tweet", false]}, 1, 0]   // if tweet field is not null add 1
                    }
                }, 
                totalCommentLikes: {
                    $sum: {
                        $cond: [{$ifNull: ["$comment", false]}, 1, 0]   // if comment field is not null add 1
                    }
                }
            }
        }
    ])

    // Total subscribers of the logged in user's channel
    const allSubscribes = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(req.user._id)     // Matching subscriptions by the current user's channel
            }
        }, 
        {
            $count: "subscribers"       // Counting the number of subscribers
        }
    ])

    // Total videos uploaded by the user
    const allVideo = await Video.aggregate([
        {
            $match: {
                videoOwner: new mongoose.Types.ObjectId(req.user._id)   // Matching videos by the current user
            }
        }, 
        {
            $count: "Videos"  // Counting the number of videos
        }
    ])

    // Total views on videos uploaded by the user
    const allViews = await Video.aggregate([
        {
            $match: {
                videoOwner: new mongoose.Types.ObjectId(req.user._id)  // Matching videos by the current user
            }
        }, 
        {
            $group: {
                _id: null, 
                allVideosViews: {
                    $sum: "$views"    // Summing up the views of all videos
                }
            }
        }
    ])

    // Constructing the final stats object 

    const stats = {
        Subscribers: allSubscribes[0].subscribers, 
        totalVideos: allVideo[0].Videos, 
        totalVideoViews: allViews[0].allVideosViews, 
        totalVideoLikes: allLikes[0].totalVideoLikes, 
        totalTweetsLikes: allLikes[0].totalTweetLikes, 
        totalCommentLikes: allLikes[0].totalCommentLikes
    }

    return res
    .status(201)
    .json(new ApiResponse(200, stats, "fetching channel stats successfully!!"))
})

// TODO: Get all the videos uploaded by the channel
const getChannelVideos = asyncHandler(async(req, res) => {
    const allVideo = await Video.find({
        videoOwner: req.user._id
    })

    if(!allVideo){
        throw new ApiError(500, "something went wrong while fetching channel all videos!!")
    }

    return res
    .status(201)
    .json(new ApiResponse(200, allVideo, "All Videos fetched successfully!!"))

})

export {
    getChannelStats, 
    getChannelVideos
}