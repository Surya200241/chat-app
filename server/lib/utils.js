import jwt from "jsonwebtoken";

//function to generate the token

export const generateToken=(userId)=>{
    const token=jwt.sign({userId},process.env.JWT_SECRET);

    return token;
}