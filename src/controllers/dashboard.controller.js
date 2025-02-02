import mongoose, { Mongoose } from "mongoose";
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js";

// TODO: Get the channel stats like total video views, total subscribers, total videos, total likes, etc.

const getChannelStats = asyncHandler(async(req, res) => {[
    // total likes
    {
        $match: {
            likedBy: new Mongoose.Types.ObjectId(req.user._id)   // Matching likes by the current user
        }
    }, 
    {
        $group: {
            _id: null,
            totalVideoLikes: {
                $sum: {
                    $cond: [
                        {$ifNull: }
                    ]
                }
            }
        }
    } 


]})

export {
    getChannelStats
}