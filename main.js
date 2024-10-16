// 1. Install all dependencies, configure express and port:
const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const config = require('./config-db.js');
const path = require("path");
const app = express();
const API_PORT = 3000;
const { nanoid } = require('nanoid')

// 2. Configure mongo db database
const url = `mongodb://${config.username}:${config.password}@${config.url}:${config.port}/${config.database}?authSource=admin`;
const client = new MongoClient(url);
let runsCollection, userCollection ;

// 3. Import the router:
const authRoute = require("./router/authRoute");

// 4. Set up urls:
app.use(express.urlencoded({ extended: true })) 
app.use(express.json());

//5. Middleware:
app.use(authRoute);


/////// Function for development /////// 
  // a. drop runsCollection 
function cleanStateRuns(){
  client.db().collection("runsCollection").drop()
}
  //b. drop userCollection
function cleanStateUsers(){
  client.db().collection("userCollection").drop()
}
  // ! Only use (comment out) when you want to drop all data in the collection ! // 
// cleanStateRuns() // call when you need to cleanState of runs
// cleanStateUsers() // call when you need to cleanState of users
/////// End of function for development /////// 

// Function adds three basic runs to the collection so the page never loads empty:
function addBasicRuns(){
      runsCollection.insertMany([	
        { _id: nanoid(5),
          title: "Westminster to Tower Bridge",
          date: "2024-09-28",
          time:"09:00",
          description: "From the tube station, follow the Embankment along the north side of the river. You\'ll pass under several bridges and by impressive buildings, including St Paul\'s Cathedral, before reaching the 950-year-old Tower of London. Cross Tower Bridge, follow the signs to not get lost around London Bridge and then you\'re on the fully pedestrianized home stretch. Check off Shakespeare\'s Globe, Tate Modern and the London Eye before heading over Westminster Bridge for the end.",
          start: "Westminster tube station,Lat: 51.5013, Lng: 0.1248",
          end: "Westminster tube station",
          meetingpts: ["St Paul's Cathedral", "Tower of London", "Tower Bridge", "London Eye"],
          distance: "10km",
          creator: "",
          interested: [], },
        { _id: nanoid(5),
          title: "St James\'s Park to Hyde Park",
          date: "2024-04-10",
          time:"14:30",
          description: "Start in St James\'s Park, a green space dating back centuries (the pelicans in the lake were introduced in 1664), before heading up The Mall, London\'s main ceremonial thoroughfare, toward Buckingham Palace. After a quick bow/curtsy, enter Green Park \- particularly beautiful in spring when \'s carpeted with daffodils \- and head for its northwest corner where you run under the Wellington Arch (named after the Napoleon-defeating British duke) and into Hyde Park. Jog along the Serpentine lake towards another royal abode, Kensington Palace, and the end of the route.",
          start: "St James\'s Park tube station,Lat: 51.4995, Lng: 0.1337",
          end: "Kensington Palace",
          meetingpts: ["The Mall", "Wellington Arch", "Serpentine"],
          distance: "6km",
          creator: "",
          interested: [{username: "Mary56", userId: nanoid(5)}], },
        { _id: nanoid(5),
          title: "Up hill to Hampstead Heath",
          date: "2024-10-03",
          time:"10:45",
          description: "Get the hard part out of the way and head straight up Parliament Hill. Your reward is a famously spectacular panorama across the whole of London. Wind your way north along the paths and through woodland to Kenwood House, an 18th-century mansion free to visit and with a fine art collection. From here it\'s a case of choosing your own path back to the train station \- a suggested option is to cool down with a quick swim in one of the natural ponds that dot the heath (men\'s, women\'s and mixed available).",
          start: "Hampstead Heath overground station,Lat: 51.5553, Lng: 0.1659",
          end: "Hampstead Heath overground station",
          meetingpts: ["Kenwood House", "Hampstead Pond"],
          distance: "5km",
          creator: "",
          interested: [],}
      ])
}

// Function initiates a run object with a unique id for every submitted forms to create a run, it returns the run to be stored in database
function getNewRun(newRun){
  let run = {
    _id: nanoid(5),
    title: newRun.title,
    date: newRun.date,
    time: newRun.time,
    description: newRun.description,
    start: newRun.start,
    end: newRun.end,
    meetingpts: newRun.meeting,
    distance: newRun.distance,
    route: newRun.route,
    pace: newRun.pace,
    creator: newRun.creator,
    interested: [],
  }
  return run;
}

// This API gets the information from "Create Run" form submitted and adds them to our database
app.post('/newRun', function(req, res, next){
  let run = getNewRun(req.body)
  runsCollection.insertOne(run)
  .then(response => console.log("Run added, ID:", response.insertedId))
  .catch(error => {
    console.log("Could not add the run", error.message);
    if(error.name != "MongoError" || error.code != 11000) throw error;
  });
})

// This API gets all the runs that have been saved on the Database and send them back to client:
app.get('/allRuns', function(req, res, next){
  runsCollection.find({}).toArray()
  .then(run => {
    res.status(200).json(run)
  })
  .catch(err => { 
    res.status(400).send("Could not get runs");
  })
})

// This API gets a run based on the ID and adds the username and userId of the interested user to the interested array of object:
app.post('/newInterest', function(req, res, next){
  console.log("received", req.body)
  runsCollection.updateOne({_id: req.body.run}, { $push: { interested: {username: req.body.username, userId: req.body.userId}} })
})


// These two app.get handle the redirection to the profile page and create a run page:
app.get('/userpofile',async (req,res)=>{
   try{
    res.sendFile(path.join(__dirname ,'.',"public","profile.html"))
    //     res.status(200).json(req.body)
    }catch(err){
        res.status(500).json({message:err.message})
    }
  
})

app.get('/routes',async (req,res)=>{
  try{
   res.sendFile(path.join(__dirname ,'.', "public","runs","createRun.html"))
   //     res.status(200).json(req.body)
   }catch(err){
       res.status(500).json({message:err.message})
   }
 
})


// /!\ KEEP AT BOTTOM OF PAGE /!\
// app.get to use the correct homepage:
app.use(express.static(__dirname + "/public"));

// The code below was copied and adapted from CS5003 - Week 7 - MongoDB exercises solution
  // The code connects to the database, logs in console, it then checks is the runs collection has more than 3 documents. 
  // If it doesn't, it runs addBasicRuns() to add three sample runs.
  // Finally, it connects to the correct port
client.connect()
.then(conn => {
    runsCollection = client.db().collection(config.collection.runs);
    userCollection = client.db().collection(config.collection.user);
    console.log("main.js connected.", conn.s.url.replace(/:([^:@]{1,})@/, ':****@')) 
})
.catch(err => { console.log(`Could not connect to ${url.replace(/:([^:@]{1,})@/, ':****@')}`, err);  throw err; })
.then(() => { 
    client.db().collection("runsCollection").countDocuments().then((docs) => {
    if(docs < 3){
      addBasicRuns()
      console.log("Template run collection has been initiated")
      } else {
      console.log("Template run collection has already been added")
    }
  })
 })
.then(() => app.listen(API_PORT, () => console.log(`Listening on localhost: ${API_PORT}`)))
.catch(err => console.log(`Could not start server`, err))