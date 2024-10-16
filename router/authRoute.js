// 1. Install all dependencies, configure express and port:
const express = require("express");
const router = express.Router();
const MongoClient = require("mongodb").MongoClient;
const config = require("../config-db");
const { nanoid } = require('nanoid')

// 2. Configure mongo db database
const url = `mongodb://${config.username}:${config.password}@${config.url}:${config.port}/${config.database}?authSource=admin`;
const client = new MongoClient(url);
let usersCollection = null;

// 3. Connect to mongo db database and feedbacks in the console.
client.connect().then((conn) => {
    usersCollection = client.db().collection(config.collection.user);
    console.log("authRoute connected.", conn.s.url.replace(/:([^:@]{1,})@/, ":****@"));
  })
  .catch((err) => {
    console.log(
      `Could not connect to ${url.replace(/:([^:@]{1,})@/, ":****@")}`,
      err
    );
    throw err;
  });

// A. user registers:
// This API checks (a) if the input for username or password is empty, then (b) if the user is already registered. 
// If the user is not registered, it (c) adds the user to the database.
// /!\ change This username already exists + Registered new user successfully

router.post("/api/user/reg", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ authInfo: "Please enter a username and password" });
  }
  try {
    const user = await usersCollection.findOne({ username: username });
    console.log(`Found the registered user:${user}`);
    if (user) {
      res.status(400).json({ authInfo: "This username already exists" });
    } else {
      const userInfo = await usersCollection.insertOne({
        _id: nanoid(5),
        username,
        password,
      });
      console.log("Registered new user successfully");

      // Sets userId to be the id of the inserted document:
      const userId = userInfo.insertedId;
      console.log("userId:", userId)
      return res.status(200).json({
        authInfo: "registered successfully",
        username: username,
        userId: userId,
      }); 
    }
  } 
  catch (err) {
    res.status(400).json({ err });
  }

});

// B. User logs in
// This API checks (a) if the input for username or password is empty, then (b) search for the user and logs them in. 
// If the user is not found, (c) it prompts user to register
// /!\ Change "Please enter a username and password" and "This username does not exist" && "Found the user:"
router.post("/api/user/login", async (req, res) => {
  console.log("received user login request:", req.body);
  const { username, password } = req.body;
  
  // console.log(`username:${username}`);
  //check if the input is null
  if (!username || !password) {
    return res.status(400).json({ authInfo: "Please enter a username and password" });
  }

  try {
    const user = await usersCollection.findOne({ username: username });
    console.log(`Found the user:${user}`);
    if (!user) {
      return res.status(400).json({ authInfo: "This username does not exist" }); //
    } else if (user.password !== password) {
      return res.status(400).json({ authInfo: "Wrong password" });
    } else {
      console.log("login successfully");
      const userId = user._id;
      
      return res.status(200).json({
        authInfo: "login successfully",
        username: username,
        userId: user._id,
      });
    }
  } catch (err) {
    res.status(400).json({ err });
  }
});

module.exports = router;
