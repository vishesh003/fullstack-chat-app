import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";


// ================= SIGNUP =================
export const signup = async (req, res) => {
  try {

    console.log(req.body);

    const { fullName, email, password } = req.body;

    // Validation
    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    // Check existing user
    const user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = new User({
      fullName: fullName,
      email,
      password: hashedPassword,
    });

    // Save user
    await newUser.save();

    // Generate JWT token
    generateToken(newUser._id, res);

    // Send response
    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
    });

  } catch (error) {

    console.log("Error in signup controller:", error.message);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};


// ================= LOGIN =================
export const login = async (req, res) => {
  try {

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // Generate token
    generateToken(user._id, res);

    // Response
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });

  } catch (error) {

    console.log("Error in login controller:", error.message);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};


// ================= LOGOUT =================
export const logout = (req, res) => {
  try {

    res.cookie("jwt", "", {
      maxAge: 0,
    });

    res.status(200).json({
      message: "Logged out successfully",
    });

  } catch (error) {

    console.log("Error in logout controller:", error.message);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};


// ================= UPDATE PROFILE =================
export const updateProfile = async (req, res) => {
  try {

    const { profilePic } = req.body;

    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({
        message: "Profile picture is required",
      });
    }

    // Upload image
    const uploadResponse = await cloudinary.uploader.upload(profilePic);

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        profilePic: uploadResponse.secure_url,
      },
      {
        new: true,
      }
    );

    res.status(200).json(updatedUser);

  } catch (error) {

    console.log("Error in update profile:", error.message);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};


// ================= CHECK AUTH =================
export const checkAuth = (req, res) => {
  try {

    res.status(200).json(req.user);

  } catch (error) {

    console.log("Error in checkAuth controller:", error.message);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};