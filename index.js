import 'dotenv/config';
import express from "express";
import { MongoClient } from 'mongodb';
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;
const client = new MongoClient(process.env.MDB_URI);

export async function connectToMongoDB() {
     try {
          await client.connect();
          console.log("You successfully connected to MongoDB!");
          return client;
     } catch (err) {
          console.dir(err);
     }
}

// middleware
app.use(cors({
     origin: 'http://localhost:3000'
}));
app.use(express.json());

// db
const dbClient = await connectToMongoDB();
const db = dbClient.db("Wanderlust");
const destinationsCollection = db.collection("destinations");

app.get('/', (req, res) => {
     res.send("Server is working well.//")
})

app.get("/travel-package", async(req, res) => {
     try{
          const cursor = await destinationsCollection.find({}).toArray();

          if(cursor) {
               return res.status(200).json({ success: true, message: "Destination fetched successfully", data: cursor })
          }

          return res.status(404).json({ success: false, message: "Something went wrong! Try again" })
     }catch(err) {
          console.error("Destination get error:", err);
          return res.status(500).json({ success: false, message: "Internal server error", error: err?.message })
     }
})

app.post("/travel-package", async(req, res) => {
     try{
          const body = await req?.body;
          const result = await destinationsCollection.insertOne(body);

          if(result?.insertedId) {
               return res.status(201).json({ success: true, insertedId: result?.insertedId, result });
          }

          return res.status(400).json({ success: false, message: "Something went wrong! Try again" })
     }catch(err) {
          console.error("Destination post error:", err);
          return res.status(500).json({ success: false, message: "Internal server error", error: err?.message })
     }
})

app.listen(PORT, () => {
     console.log(`Server is running with the port: ${PORT}`);
})