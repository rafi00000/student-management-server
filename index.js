const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;

// middleware
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());

// mongo db setup

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri =
  "mongodb+srv://delwar2021bd:koajaibona1@cluster0.mn7153h.mongodb.net/?retryWrites=true&w=majority";

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
    // database collections
    const userCollection = client.db("eduTrack").collection("users");
    const teacherCollection = client.db("eduTrack").collection("teacher-req");
    const classCollection = client.db("eduTrack").collection("classes");

    // mongo db
    // TODO: it should be admin verified
    app.get("/users", async (req, res) => {
      let result = await userCollection.find().toArray();
      res.send(result);
    });

    // getting a single user 
    app.get('/user/:email', async(req, res) =>{
      const email = req.params.email;
      console.log(email)
      const query = {email: email};
      const result = await userCollection.findOne(query); 
      res.send(result);
    })

    // checking before register if the user is already in db the taking appropriate action
    app.post("/users", (req, res) => {
      const userInfo = req.body;
      const query = { email: userInfo.email };
      const userExist = userCollection.findOne(query);
      if (!userExist) {
        res.send({ message: "user Exist in database" });
      }
      const result = userCollection.insertOne(userInfo);
      res.send(result);
    });

    // getting all the teacher req for admin panel to
    app.get("/teacher-req", async (req, res) => {
      const result = await teacherCollection.find().toArray();
      res.send(result);
    });

    // posting teacher req from req-teacher
    app.post("/teacher-req", (req, res) => {
      const data = req.body;
      const result = teacherCollection.insertOne(data);
      res.send(result);
    });

    // adding class to db
    app.post('add-class', async(req, res) =>{
      const data = req.body;
      const result = await classCollection.insertOne(data); 
      res.send(result);
    })

    // changing the role of user to teacher
    app.patch("/admin/teacher/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const updatedDoc = {
        $set: {
          role: "teacher",
        },
      };
      const result = await userCollection.updateOne(query, updatedDoc);
      res.send(result);
    });

    // changing the user role to admin
    app.patch('/admin/admin/:id', async(req, res) =>{
        const id = req.params.id;
        const doc = req.body;
        console.log(id);
        const query = {_id: new ObjectId(id)};
        const updatedDoc = {
            $set: {role: doc.role}
        } ;

        const result = await userCollection.updateOne(query, updatedDoc);
        res.send(result);
    })

    // changing the teacher req state to accepted or rejected
    app.patch("/admin/teacher-req/:email", async (req, res) => {
      const email = req.params.email;
      const data = req.body.status;
      const query = { email: email };
      const updatedDoc = {
        $set: {
          status: data,
        },
      };
      const result = teacherCollection.updateOne(query, updatedDoc);
      res.send({ message: "success" });
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.get("/", (req, res) => res.send("server is running"));
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
