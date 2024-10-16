//// UNUSED //// 
// const express = require("express");
// const router = express.Router();
// const MongoClient = require("mongodb").MongoClient;
// const config = require("../config-db");
// const path = require("path");
// const url = `mongodb://${config.username}:${config.password}@${config.url}:${config.port}/${config.database}?authSource=admin`;
// const client = new MongoClient(url);
// let runsCollection, usersCollection;

// client.connect()
//   .then((conn) => {
//     runsCollection = client.db().collection(config.collection.runs);
//     console.log("runRoute connected.", conn.s.url.replace(/:([^:@]{1,})@/, ":****@"));
//   })
//   .catch((err) => {
//     console.log(
//       `Could not connect to ${url.replace(/:([^:@]{1,})@/, ":****@")}`,
//       err
//     );
//     throw err;
//   });


// //get runs
// router.get('/',async (req,res)=>{
//   res.sendFile(path.join(__dirname ,'..',"public","runs","createRun.html"))
// })


// //create newrun
// router.post("/create", async (req, res) => {
//   try{
//     window.location.herf ="./routes/all"; 
//     res.status(200).json(req.body)

// }catch(err){
//     res.status(500).json({message:err.message})
// }

// });

// router.get('/all',async (req,res)=>{
//     try{
//     const path_detail = await runsCollection.find({}) //find all
//       res.status(200).json(path_detail)

//   }catch(err){
//       res.status(500).json({message:err.message})
//   }
// })

// //get single route _Detail 
// router.get("/update:runid", async (req, res) => {
//   try{
//     res.status(200).json(req.body)

// }catch(err){
//     res.status(500).json({message:err.message})
// }
  
// });




// router.put("/update/:runid", async (req, res) => {
//   try{
//   }catch(err){
//       res.status(500).json({message:err.message})
//   }
  
// });


// module.exports = router;
