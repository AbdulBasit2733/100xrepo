import express from "express";
import { connectDB, User } from "@repo/mongodb/client";
const app = express();

// Connect to MongoDB
connectDB();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hi There");
});

app.post("/signup", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  console.log(username);

  if (!username || !password) {
    res.status(400).json({
      success: false,
      message: "All fields are required",
    });
    return;
  }

  await User.create({
    username: username,
    password: password,
  });
  res.status(200).json({
    success: false,
    message: "Created Succesfully",
  });
});

app.listen(3004, () => {
  console.log("App is running on port 3000");
});
