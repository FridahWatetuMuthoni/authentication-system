import express from "express";
import passport from "passport";
import router from "./src/routes/index.js";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import connectDB from "./src/config/database.js";
import configurePassport from "./src/config/passport.js";

const app = express();
dotenv.config();

const PORT = process.env.PORT || 5000;
const allowedOrigins = [
  "http://localhost:5173", // Local development URL
  "https://product-store-watetu.netlify.app", // Production URL
];

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// session configuration
app.use(
  session({
    secret: "The$#@Authentication$#@Reference",
    resave: false,
    saveUninitialized: false,
  })
);

//passport configuration
configurePassport(passport);
app.use(passport.initialize());
app.use(passport.session());

//cors
app.use(
  cors({
    origin: function (origin, callback) {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true); // Allow the origin
      } else {
        callback(new Error("Not allowed by CORS")); // Reject if origin is not allowed
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"], // Allow these methods
    allowedHeaders: ["Content-Type"], // Allow these headers
  })
);

//Routes
app.use(router);

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running at: http://localhost:${PORT}`);
});
