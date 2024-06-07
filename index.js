const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

const app = express();

const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.i8cxcd4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    const db = client.db("Workday");
    const assetsCollection = db.collection("assets");
    const usersCollection = db.collection("users");
    const teamsCollection = db.collection("teams");
    // const requestsCollection = db.collection("requests");

    //post user--------------
    app.post("/users", async (req, res) => {
      const user = req.body;
      if (!user.email) {
        return res.status(400).send({ message: "Email is required" });
      }

      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);

      if (existingUser) {
        return res.status(409).send({ message: "User already exists" });
      }

      try {
        const result = await usersCollection.insertOne(user);
        res.status(201).send(result);
      } catch (error) {
        res.status(500).send({ message: "Internal Server Error" });
      }
    });

    //get all user------------
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    //2 get single user
    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const result = await usersCollection.findOne(filter);
      res.send(result);
    });

    //1 get user added data----------------
    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const result = await usersCollection.findOne({ email });
      res.send(result);
    });

    // post in team collection-----------------------------
    app.post("/team", async (req, res) => {
      const teamData = req.body;
      // const user = await teamsCollection.find({ email: teamData.email }).toArray();

      if (teamData.role !== "employee") {
        return res
          .status(400)
          .send({ message: "Only employees can be added to the team." });
      }
      const result = await teamsCollection.insertOne(teamData);
      res.send(result);
    });

    // get teams workAt email------------------
    app.get("/hrEmail/:email", async (req, res) => {
      const email = req.params.email;
      const result = await teamsCollection.findOne({ email: email });
      res.send(result);
    });

    // get workAt values all teams-----------------
    app.get("/myTeam/:email", async (req, res) => {
      const email = req.params.email;
      console.log(email)
      const result = await teamsCollection.find({ workAt: email }).toArray();
      res.send(result);
    });

    // get team add admin in employee list---------
    app.get("/team/:email", async (req, res) => {
      const email = req.params.email;
      const teamMembers = await teamsCollection
        .find({ workAt: email })
        .toArray();
      res.send(teamMembers);
    });

    app.get("/team/:email", async (req, res) => {
      const email = req.params.email;
      const result = await teamsCollection.findOne({ workAt: email });
      res.send(result);
    });

    //removed from list----------
    app.delete("/team/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await teamsCollection.deleteOne(query);
      res.send(result);
    });

    // post asset data----------
    app.post("/asset", async (req, res) => {
      const assetData = req.body;
      const result = await assetsCollection.insertOne(assetData);
      res.send(result);
    });

    //get all asset from db user in client side Assets List ---------
    app.get("/assets", async (req, res) => {
      const { search, stockStatus, assetType, sortOrder } = req.query;
      const query = {};
      // Search
      if (search) {
        query.assetName = { $regex: search, $options: "i" };
      }
      // Filter by Stock Status
      if (stockStatus) {
        if (stockStatus === "available") {
          query.quantity = { $gt: 0 };
        } else if (stockStatus === "out-of-stock") {
          query.quantity = { $eq: 0 };
        }
      }
      // Filter by Asset Type
      if (assetType) {
        query.category = assetType;
      }
      // Sorting
      const sort = {};
      if (sortOrder) {
        sort.quantity = sortOrder === "high-to-low" ? -1 : 1;
      }
      const assets = await assetsCollection.find(query).sort(sort).toArray();
      res.send(assets);
    });

    // get all assets
    app.get("/assets", async (req, res) => {
      const assets = await assetsCollection.find(req.query).toArray();
      res.send(assets);
    });

    // get asset single data
    app.get("/asset/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await assetsCollection.findOne(query);
      res.send(result);
    });

    // delete assets in client side use in assets list---------
    app.delete("/asset/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await assetsCollection.deleteOne(query);
      res.send(result);
    });

    // update assets
    app.put("/asset/:id", async (req, res) => {
      const id = req.params.id;
      const assetData = req.data;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: { ...assetData },
      };
      const result = await assetsCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    // request for assets section-----------------
    app.put("/request-asset/:id", async (req, res) => {
      const id = req.params.id;
      const asset = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateAsset = {
        $set: {
          ...asset,
          quantity: parseInt(asset.quantity) - 1, // Decrement the quantity by 1
        },
      };
      const result = await assetsCollection.updateOne(
        filter,
        updateAsset,
        options
      );
      res.send(result);
    });

    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Assignment 12 is running...!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
