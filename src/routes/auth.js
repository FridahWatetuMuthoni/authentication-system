import { Router } from "express";
import hashPassword from "../utils/helpers.js";
import User from "../models/User.js";
import passport from "passport";

const auth_router = Router();

//Register Route
auth_router.post("/api/auth/register", async (request, response) => {
  const { firstName, lastName, username, email, password } = request.body;
  if (!firstName || !lastName || !username || !email || !password) {
    return response
      .status(400)
      .json({ success: false, message: "please provide all the fields" });
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return response.status(400).json({
        success: false,
        message: "A user with that email already exists",
      });
    }

    const hashed_password = hashPassword(password);
    const user = await User.create({
      firstName,
      lastName,
      username,
      email,
      password: hashed_password,
    });
    return response
      .status(201)
      .json({ success: true, message: "User registered successfully", user });
  } catch (error) {
    console.log(error);
    return response.status(500).json({
      success: false,
      message: "An error occured when registering the user",
    });
  }
});

//login route
auth_router.post("/api/auth/login", async (request, response, next) => {
  const { email, password } = request.body;

  if (!email || !password) {
    return response
      .status(400)
      .json({ success: false, message: "Email and Password are required" });
  }

  // Authenticate the user using passport
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return response.status(500).json({
        success: false,
        message: "An error occured when trying to authenticate the user",
      });
    }

    // If no user is found, send invalid credentials message
    if (!user) {
      return response
        .status(400)
        .json({ success: false, message: "Invalid Creditials" });
    }

    // Log in the user
    request.logIn(user, (error) => {
      if (error) {
        return response.status(500).json({
          success: false,
          message: "An error occured when trying to login",
        });
      }

      // Send success response
      return response
        .status(200)
        .json({ success: true, message: "User logged in", user });
    });
  })(request, response, next);
});

//Google Login
auth_router.get(
  "/api/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);
auth_router.get(
  "/api/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/",
    failureRedirect: "/api/auth/login",
  })
);

//logout route
auth_router.get("/api/auth/logout", (request, response) => {
  request.logOut((err) => {
    return response.status(500).json({
      success: false,
      message: "An error occured when trying to logout",
    });
  });
  return response
    .status(200)
    .json({ success: true, message: "User logged out" });
});

//get current user
auth_router.get("/api/auth/user", (request, response) => {
  if (!request.isAuthenticated) {
    return response
      .status(401)
      .json({ success: false, message: "Unauthorised" });
  }
  return response.status(200).json({
    success: true,
    message: "success retriving the user",
    user: request.user,
  });
});

//edit user
auth_router.put("/api/auth/user", async (request, response) => {
  if (!request.isAuthenticated) {
    return response
      .status(401)
      .json({ success: false, message: "Unauthorised" });
  }

  const { firstName, lastName, username, email, password } = request.body;
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return response
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    //check if the new email is already in use by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return response
          .status(400)
          .json({ success: false, message: "Email is already in use" });
      }

      //set new email if its unique
      user.email = email;
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.username = username || user.username;

    if (password) {
      user.password = hashPassword(password);
    }

    await user.save();
    return response
      .status(200)
      .json({ success: true, message: "user updated successfully" });
  } catch (error) {
    console.log(error);
    return response.status(500).json({
      success: false,
      message: "An error occured when trying to edit the user",
    });
  }
});

export default auth_router;
