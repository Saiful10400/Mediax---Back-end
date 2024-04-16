const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.port || 5000;
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors=require("cors")
const bodyParser=require("body-parser")
require("dotenv").config();

const app = express();
app.use(cors())
app.use(bodyParser.json())

const server = createServer(app);
const io = new Server(server,{
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
      }
});

// socket io handle.
io.on("connection", (socket) => {
  console.log("a user is connected.",socket.id);
  socket.on("message",res=>{
    console.log(res)
  })
});

const uri = `mongodb+srv://${process.env.MONGO_USER_NAME}:${process.env.MONGO_USER_PASSWORD}@cluster0.qe6izo7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // routes.
    app.get("/", async (req, res) => {
      res.send("server is running.");
    });

    const database= client.db("Tele_medecine")
    // .....manage all user.............
    const doctorsCollection=database.collection("Doctors")
    // 1. add a new doctor.
    app.post("/add-a-new-doctor", async(req,res)=>{
        const data=req.body.data
        const result=await doctorsCollection.insertOne({...data})
        res.send(result)
    })
    // 2.get a doctor data.

    app.post("/get-a-doctor-data", async(req,res)=>{
      const {email}=req.body
      const result=await doctorsCollection.findOne({email})
      res.send(result)
  })

  // 3.upload doctor photo url.
  
  app.post("/upload-doctor-photo", async(req,res)=>{
    const {profilePhoto,email}=req.body
    const updateData={
      $set:{
        profilePhoto,
        publish:true
      }
    } 
    const result=await doctorsCollection.updateOne({email},updateData,{upsert:true})
    res.send(result)
})

// 4.doctor bio uploas.
app.post("/doctor-post-bio",async(req,res)=>{
  const data=req.body
  console.log(data)
  const updateData={
    $set:{
      bio:data.bio
    }
  } 
  const result=await doctorsCollection.updateOne({email:data.person},updateData,{upsert:true})
  res.send(result)
})

// 5. post doctor educational qualification.


app.post("/post-doctor-qualification", async(req,res)=>{
  const {email,data}=req.body
  const result=await doctorsCollection.updateOne({email},{$push:{education:data}},{upsert:true})
  res.send(result)
})


// 6. get all doctors.
app.get("/get-all-doctor",async(req,res)=>{
  const result=await doctorsCollection.find({publish:true}).toArray()
  res.send(result)
})





    // 1.2 manage all patient.
    const patientCollection=database.collection("Patients")

    // add a new patient.
    app.post("/add-a-new-patient", async(req,res)=>{
        const data=req.body
       
     
            const result=await patientCollection.insertOne({data})
            res.send(result)
    })
 


    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

server.listen(port, () => {
  console.log("this server is running.");
});
