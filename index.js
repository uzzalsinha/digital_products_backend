const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require("jsonwebtoken");
const app = express()
const port = 5000

app.use(cors())
app.use(express.json())

// Token creation
function createToken(user) {
  const token = jwt.sign(
    {
      email: user.email,
    },
    "secret",
    { expiresIn: "7d" }
  );
  return token;
}

// VerifyToken middleware
function verifyToken(req, res, next) {
  const token = req.headers.authorization.split(" ")[1];
  const verify = jwt.verify(token, "secret");
  console.log(verify);
  if (!verify?.email) {
    return res.send("You are not authorized");
  }
  req.user = verify.email;
  next();
}




const uri = "mongodb+srv://uzzalsinha89:fdWvMvqfAzWqYKMn@cluster0.6ahcmey.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });

    const userDB = client.db("userDB");
   
    const userColl = userDB.collection("userColl");
    const productDB = client.db("productDB");
    const productColl = productDB.collection("productColl");

    // Product Addition
    app.post("/products", verifyToken, async(req, res) => {
      const productData = req.body;
      const result = await productColl.insertOne(productData);
      res.send(result)
    })

    // Product update  
    app.patch("/products/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
      const result = await productColl.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedData }
      );
      res.send(result);
    });



    // Get request showing all products
      app.get("/products", async(req, res) => {
     
      const productData = productColl.find();
      const result = await productData.toArray()
      res.send(result)
    })

    // Showing product details
      app.get("/products/:id", async(req, res) => {
        const id = req.params.id
     
      const productDetails = await productColl.findOne({_id: new ObjectId(id)})
      res.send(productDetails)
    })

    // user info
    app.post("/user", async(req, res) => {
      const user = req.body;
      const token = createToken(user);
      console.log(token);
      const isUserCreated = await userColl.findOne({email: user?.email})
      if (isUserCreated?._id){
        return res.send({
          status: "success",
          message: "Login success",
          token,
        });
      }
      await userColl.insertOne(user);
      console.log(user)
      res.send({token})
    })


    app.get("/user/get/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const result = await userColl.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });



    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const result = await userColl.findOne({ email });
      res.send(result);
    });

    app.patch("/user/:email", async (req, res) => {
      const email = req.params.email;
      const userData = req.body;
      const result = await userColl.updateOne(
        { email },
        { $set: userData },
        { upsert: true }
      );
      res.send(result);
    });



    // const result = await userColl.insertOne(doc);
    console.log("DB connected successfully.");
  } finally {

  }
}
run().catch(console.dir);






app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

// uzzalsinha89
// fdWvMvqfAzWqYKMn