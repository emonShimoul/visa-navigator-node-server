const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pabg0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log(uri);

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const visaCollection = client.db("visaNavigatorDB").collection("visa");
    const visaApplicationCollection = client
      .db("visaNavigatorDB")
      .collection("visaApplications");
    const userCollection = client.db("visaNavigatorDB").collection("users");

    // Visa related APIs
    app.get("/visas", async (req, res) => {
      const cursor = visaCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/all-visas/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await visaCollection.findOne(query);
      res.send(result);
    });

    app.get("/visas/:email", async (req, res) => {
      const email = req.params.email;
      //   console.log(email);
      const query = { userEmail: email };
      const cursor = visaCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/visas", async (req, res) => {
      const newVisa = req.body;
      console.log("data: ", newVisa);
      const result = await visaCollection.insertOne(newVisa);
      res.send(result);
    });

    app.delete("/visas/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await visaCollection.deleteOne(query);
      res.send(result);
    });

    app.put("/visas/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedVisa = req.body;
      console.log(updatedVisa);

      const visa = {
        $set: {
          countryImage: updatedVisa.countryImage,
          countryName: updatedVisa.countryName,
          visaType: updatedVisa.visaType,
          processingTime: updatedVisa.processingTime,
          requiredDocuments: updatedVisa.requiredDocuments,
          description: updatedVisa.description,
          ageRestriction: updatedVisa.ageRestriction,
          fee: updatedVisa.fee,
          validity: updatedVisa.validity,
          applicationMethod: updatedVisa.applicationMethod,
        },
      };

      const result = await visaCollection.updateOne(filter, visa, options);
      res.send(result);
    });

    // Visa application related APIs
    app.post("/visa-application", async (req, res) => {
      const newVisaApplication = req.body;
      //   console.log("application: ", newVisaApplication);
      const result = await visaApplicationCollection.insertOne(
        newVisaApplication
      );
      res.send(result);
    });

    app.get("/visa-application/:email", async (req, res) => {
      const email = req.params.email;
      //   console.log(email);
      const query = { userEmail: email };
      const cursor = visaApplicationCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.delete("/visa-application/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await visaApplicationCollection.deleteOne(query);
      res.send(result);
    });

    // Users related API
    app.get("/users", async (req, res) => {
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const newUser = req.body;
      //   console.log("Creating new user", newUser);
      const result = await userCollection.insertOne(newUser);
      res.send(result);
    });

    app.patch("/users/", async (req, res) => {
      const email = req.body?.email;
      const filter = { email };

      const updatedDoc = {
        $set: {
          lastSignInTime: req.body?.lastSignInTime,
        },
      };

      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //   await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Visa Navigator server is running!");
});

app.listen(port, () => {
  console.log(`Visa Navigator is running on port: ${port}`);
});
