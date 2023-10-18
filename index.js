const express = require("express");
const cors = require("cors");
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5001;
const app = express();


app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.SECRET_USER_NAME}:${process.env.SECRET_PASSWORD}@cluster0.z9hqskk.mongodb.net/?retryWrites=true&w=majority`;

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
    const productsCollection = client.db('productsDB').collection('products');

    // display
    app.get('/products', async (req, res) => {
      const cursor = productsCollection.find(); //cursor point korar jonno
      const result = await cursor.toArray()
      res.send(result);
    })

    app.post('/products', async (req, res) => {
      const addNewProduct = req.body;
      // console.log(addNewProduct,"work")
      const result = await productsCollection.insertOne(addNewProduct)
      res.send(result)
    });

    //update
    app.put('/products/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const upDateProduct = req.body
      const upDateProductData = {
        $set: {
          name: upDateProduct.name,
          image: upDateProduct.image,
          model: upDateProduct.model,
          brand: upDateProduct.brand,
          availability: upDateProduct.availability,
          price: upDateProduct.price,
          description: upDateProduct.description,
          rating: upDateProduct.rating,
          tags: upDateProduct.tags,
          image: upDateProduct.image,
        }
      }
      const result = await productsCollection.updateOne(filter, upDateProductData, options)
      res.send(result)
    })
    // delet
    //  app.delete('/products/:id',async (req,res) =>{
    //   const id = req.params.id;
    //   const query = {_id: new ObjectId(id)}
    //   const result = await productsCollection.deleteOne(query)
    //   res.send(result);
    // })

    // loade new
    app.get('/products/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await productsCollection.findOne(query)
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Crud is running...");
});

app.listen(port, () => {
  console.log(`Simple Crud is Running on port ${port}`);
});

