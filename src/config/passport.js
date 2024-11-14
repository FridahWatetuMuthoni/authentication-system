import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import User from "../models/User.js";

const configurePassport = (passport) => {
  // Local Strategy for Email and Password

  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email });
          if (!user) {
            return done(null, false, { message: "That user was not found" });
          }

          const is_match = bcrypt.compareSync(password, user.password);
          if (!is_match) {
            return done(null, false, { message: "Password is incorrect" });
          }

          return done(null, user);
        } catch (error) {
          console.log(error);
          return done(error);
        }
      }
    )
  );

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          //check if user exists
          let user = await User.findOne({ googleId: profile.id });

          //create a new user if one does not exist
          if (!user) {
            user = await User.create({
              googleId: profile.id,
              firstName: profile.name.givenName,
              lastName: profile.name.familyName,
              email: profile.emails[0].value,
            });
          }

          return done(null, user);
        } catch (error) {
          console.log(error);
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    console.log("serializer");
    done(null, user._id.toString());
  });
  passport.deserializeUser(async (_id, done) => {
    console.log("deserializer");

    try {
      const user = await User.findById(_id);
      if (!user) {
        throw new Error("User was not found");
      }
      return done(null, user);
    } catch (error) {
      console.log(error);
      return done(error, null);
    }
  });
};

export default configurePassport;
