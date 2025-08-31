import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary  from "../lib/cloudinary.js";
import mongoose from "mongoose";
import { io,userSocketMap } from "../server.js";


export const getUserForSidebar = async (req, res) => {
  try {
    // Logged-in user's ID
    const loggedInUserId = req.user._id;

    // Fetch all users except the logged-in one
    const filteredUsers = await User.find({
      _id: { $ne: new mongoose.Types.ObjectId(loggedInUserId) }
    })
      .select("-password") // don't send password field
      .lean();

    console.log("Users for sidebar:", filteredUsers.map(u => ({
      id: u._id.toString(),
      fullName: u.fullName
    })));

    return res.status(200).json({ success: true, users: filteredUsers });
  } catch (error) {
    console.error("Error in getUserForSidebar:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};



//Get all  messages for a selected user

export const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;
    const myId = req.user._id;
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: myId }
      ]
    })
    await Message.updateMany({ senderId: selectedUserId, receiverId: myId }, { seen: true })
    res.json({ success: true, messages });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, error: error.message });
  }
};

// api to mark the message as seen using message id

export const markMessageAsSeen=async (req,res)=>{
  try {
     const {id}=req.params;
     await Message.findByIdAndUpdate(id,{seen:true});
     res.json({ success: true});
  } catch (error) {
     console.log(error.message);
    res.json({ success: false, error: error.message });
  }
}

// send message to  selected user

export const sendMessage=async(req,res)=>{
  try {
    const {text,image}=req.body;
    const receiverId=req.params.id;
    const senderId=req.user._id;

    let imageUrl;
    if(image){
      const uploadResponse=await cloudinary.uploader.upload(image);
      imageUrl=uploadResponse.secure_url;
    }
    const newMessage=await Message.create({
      senderId,
      receiverId,
      text,
      image: imageUrl
    })

    //emit the new message to the receiver's socket
    const receiverSocketId=userSocketMap[receiverId];
    if(receiverSocketId){
      io.to(receiverSocketId).emit("newMessage",newMessage)
    }
      res.json({ success: true, newMessage });

  } catch (error) {
    console.log(error.message);
    res.json({ success: false, error: error.message });
  }
}