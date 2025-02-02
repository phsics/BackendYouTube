import mongoose, {isValidObjectId} from "mongoose";
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {User} from "../models/user.model.js"
import {Video} from "../models/video.model.js"
import { rmSync } from "fs";

// create playlist
const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    
    if(!name || name?.trim() === "" || !description || description?.trim() === ""){
        throw new ApiError(403, "Name and description is required!!")
    }
    const playlist = await Playlist.create({
        name, 
        description, 
        owner: req.user._id
    })

    if(!playlist){
        throw new ApiError(500, "Something went wrong while creating the playlist")
    }

    return res
    .status(201)
    .json(new ApiResponse(200, playlist, "playlist created successfully"))
})

// get playlist by id

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params

    if(!isValidObjectId(playlistId)){
        throw new ApiError(403, "this playlist is not valid!")
    }

    const playlist = await Playlist.findById(playlistId)
    
    if(!playlist){
        throw new ApiError(404, "playlist is not found!!")
    }

    return res
    .status(201)
    .json(new ApiResponse(200, playlist, "playlist fetched successfully!!"))
})

// get user playlist by userId

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params

    if(!isValidObjectId(userId)){
        throw new ApiError(403, "this use id not valid!!")
    }
    // user refer to the channel owner or the person who created the playlist

    // find the user in the database
    const user = await findById(userId)
    
    if(!user){
        throw new ApiError(404, "User not found!!")
    }

    // Start an aggregation pipeline on the Playlist model

    const playlists = await Playlist.aggregate([
        {
            // The $match stage filters the documents to only pass those where the "owner" 
            // field matches the "userId"

            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        }, 
        {
            // $The lookup stage performs a left outer join to the videos collection in the same 
            // database to filter in documents from the joined collection for processing

            $lookup: {

                // The name of the collection in the same database to perform the join with 
                from: "videos",

                // The field from the documents input to the $lookup stage. 'video' is assumed 
                // to be a field in the 'playlists' collection that contains the ObjectId of the associated video
                localfield: "video", 

                // The field from the documents in the from collection . _id is the unique
                // identifier of a video in the videos collection
                foreignField: "_id" ,

                // The name of the new array field to add to the input documents. The new array field contains 
                // the ObjectId of the associated video
                as: "videos"
            }
        }, 
        {
            // The $addFields stage adds new fields to documents. The new fields can contain both new and 
            // existing field values
            $addFields: {
                playlists: {
                    //  The $first operator returns the first element in an array
                    $first: "$videos"
                }
            }
        }
    ])

    if(!playlists){
        throw new ApiError(500, "Something went wrong while fetching playlists")
    }

    return res
    .status(201)
    .json(new ApiResponse(200, playlists, "playlists fetched successfully!!"))

})

// add video to playlist
const addVideoToPlaylist = asyncHandler(async (req,res) => {
    const {playlistId, videoId} = req.params

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400, "playlist id or video id is not valid")
    }

    // find playlist in db
    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(404, "playlist not found!!")
    }

    if(playlist.owner.toString() !== req.user._id.toString()){
        throw new ApiError(400, "you don't have permission to add video to playlist :(")
    }

    // find video in db
    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "Video is not found :(")
    }

    if(playlist.videos.includes(videoId)){
        throw new ApiError(400, "video already exists in the playlist :|")
    }

    const addToPlaylist = await Playlist.findByIdAndUpdate(
        playlistId, 
        {
            $push: {
                video: videoId
            }
        }, 
        {
            new: true
        }
    )

    if(!addToPlaylist){
        throw new ApiError(500, "Something went while adding video to playlist :(")
    }

    return res
    .status(201)
    .json(new ApiResponse(200, addToPlaylist, "Video is added to playlist successfully :)"))
})

// remove video from playlist
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400, "playlist id or video id is not valid!!")
    }

    // find playlist in db so you can remove the video from playlist

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(400, "playlist is not found")
    }

    if(playlist?.owner.toString() !== req.user._id?.toString()){
        throw new ApiError(403, "you dont have permission to remove video from playlist :`|")
    }

    // video you're trying to remove from the playlist actually exists in video db
    if(!playlist.videos.includes(videoId)){
        throw new ApiError(400, "video exists but not exists in playlist")
    }

    const removeVideo = await Playlist.findByIdAndUpdate(
        playlistId, 
        {
            $pull: {
                videos: videoId
            }
        }, 
        {
            new: true
        }
    )

    if(!removeVideo){
        throw new ApiError(500, "Something went wrong while removing video from the playlist :(")
    }
    return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        removeVideo,
        "Video removed from playlist successfully!!"
      )
    )
})

// delete playlist
const deletePlaylist = asyncHandler(async (req,res) => {
    const {playlistId} = req.params

    if(!isValidObjectId(playlistId)){
        throw new ApiError(403, "this playlist id is not valid!!")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(404, "playlist not found!!")
    }

    if(playlist?.owner.toString() !== req.user._id?.toString()){
        throw new ApiError(400, "you don't have permission to delete this playlist!!")
    }

    const deletePlaylist = await Playlist.deleteOne({
        _id: playlistId
    })

    if(!deletePlaylist){
        throw new ApiError(500, "Something went wrong while deleting playlist!!")
    }

    return res
    .status(201)
    .json(new ApiResponse(200, deletePlaylist, "playlist deleted successfully"))
})

// update playlist
const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {NewName, NewDescription} = req.body

    if(!isValidObjectId(playlistId)){
        throw new ApiError(403, "this playlist id is not valid!!")
    }

    // if any one is provided
    if(!NewName || NewName?.trim() === "" || !NewDescription || NewDescription?.trim()){
        throw new ApiError(403, "Either name or description is required!")
    }
    
    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(404, "playlist not found!")
    }

    if(playlist?.owner?.toString() !== req.user._id?.toString()){
        throw new ApiError(403, "you don't have permission to update the playlist!")
    }

    const updatePlaylist = await Playlist.findByIdAndUpdate(
        playlistId, 
        {
            $set: {
                name: NewName, 
                description: NewDescription
            }
        }, 
        {
            new: true
        }
    )
    if(!updatePlaylist){
        throw new ApiError(500, "Something went wrong while updating playlist :|")
    }

    return res
    .status(201)
    .json(new ApiResponse(200, updatePlaylist, "Playlist updated successfully!"))
})

export {
    createPlaylist,
    getPlaylistById, 
    getUserPlaylists, 
    addVideoToPlaylist, 
    removeVideoFromPlaylist, 
    deletePlaylist, 
    updatePlaylist
}