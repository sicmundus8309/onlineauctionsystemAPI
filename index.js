import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import bcrypt from "bcrypt";
import cors from "cors";
import User from './Models/usersschema.js';
import {createToken , validateToken} from "./JWT.js";

dotenv.config();
await mongoose.connect(process.env.MONGODB_URL)

const app = express();
const port = process.env.PORT || 5001;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
  origin: "http://localhost:3000", 
  credentials: true 
}));

app.use(cors());

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  const checkUser = await User.findOne({ email: email });
  if (checkUser) {
    console.log("user already exists");
    return res.status(400).json({ meassage: "User already exists" })
  } else {
    bcrypt.hash(password, 10, async (err, hash) => {
      if (err) {
        console.log("Error in hashing password")
        return res.status(400).json({ meassage: "Error in hashing password" });
      } else {
        const user = new User({ name: name, email: email, password: hash })
        await User.create({ name: name, email: email, password: hash });
        console.log("User created successfully")
        const accessToken = createToken({ email: email ,password:hash});
        res.json({ message: "User created successfully",accessToken:accessToken });
      }
    })
  }
})

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const checkuser = await User.findOne({ email: email });
  if (!checkuser) {
    console.log("user does not exists");
    return res.status(400).json({ meassage: "user does not exists" })
  } else {
    bcrypt.compare(password, checkuser.password, (err, result) => {
      if (err) {
        console.log("Error in comparing password");
        return res.status(400).json({ meassage: "Error in comparing password" });
      } else {
        if (result) {
            const accessToken = createToken({ email: email ,password:password});
             console.log("User logged in successfully");
          res.json({ message: "User logged in successfully",accessToken:accessToken });
        } else {
          console.log("Password is incorrect");
          return res.status(400).json({ meassage: "Password is incorrect" });
        }
      }
    })
  }
})

app.post("/hello",(req,res)=>{
  res.json({message:"hello"});
  })