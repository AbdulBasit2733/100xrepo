import express from "express";
import { client } from "@repo/db/client";
const app = express();

app.use(express.json())

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

  await client.user.create({
    data: {
      username: username,
      password: password,
    },
  });
  res.status(200).json({
    success:false,
    message:"Created Succesfully"
  })
});

app.listen(3004, () => {
  console.log("App is running on port 3000");
});
