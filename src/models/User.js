import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  username: String,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: String,
  googleId: String,
});

const User = mongoose.model("User", UserSchema);

export default User;
