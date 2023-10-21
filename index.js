// const express = require("express");
// const cors = require("cors");
// require('dotenv').config()
// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const port = process.env.PORT || 5001;
// const app = express();

import express from "express";
import cors from "cors";
import dotenv from "dotenv/config";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";

const port = process.env.PORT || 5001;
const app = express();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.SECRET_USER_NAME}:${process.env.SECRET_PASSWORD}@cluster0.z9hqskk.mongodb.net/?retryWrites=true&w=majority`;

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
    const productsCollection = client.db("productsDB").collection("products");
    const users = client.db("productsDB").collection("users");

    app.post("/create-user", async (req, res) => {
      const { email } = req.body;
      const cursor = users.find();
      const result = await cursor.toArray();
      const foundUser = result.filter((user) => user.email === email);
      if (foundUser.length) {
        console.log("already added");
        return res.send("already added");
      }
      const user = await users.insertOne({ email, cart: [] });
      res.end();
    });

    app.post("/request-cart", async (req, res) => {
      const { email } = req.body;
      const cursor = users.find();
      const result = await cursor.toArray();
      const foundUser = result.filter((user) => user.email === email);
      res.json(foundUser[0].cart);

      res.end();
    });

    app.delete("/delete-cart-item", async (req, res) => {
      const id = req.body.id;
      const email = req.body.email;

      const cursor = users.find();
      const result = await cursor.toArray();
      const foundUser = result.filter((user) => user.email === email);

      const allCart = [...foundUser[0].cart];

      const updatedCart = allCart.filter((item) => item.id !== id);

      await users.updateOne(
        { email: email },
        { $set: { cart: updatedCart } },
        { upsert: true }
      );
      // console.log(updatedCart);

      res.end();
    });

    app.put("/add-to-cart", async (req, res) => {
      const data = req.body;
      const cursor = users.find();
      const result = await cursor.toArray();
      const foundUser = result.filter((user) => user.email === data.email);
      const newProduct = {
        id: data.id,
        image: data.image,
        brand: data.brand,
        name: data.name,
        price: data.price,
      };

      const allCart = [...foundUser[0].cart, newProduct];

      await users.updateOne(
        { email: data.email },
        { $set: { cart: allCart } },
        { upsert: true }
      );

      res.end();
    });

    // display
    app.get("/products", async (req, res) => {
      const cursor = productsCollection.find(); //cursor point korar jonno
      const result = await cursor.toArray();
      res.send(result);
    });

    // car filter
    //  app.get('/products/:name',async(req, res) =>{
    //   const brandNameCar = req.params.name;
    //   const cursor = productsCollection.find();
    //   const result = await cursor.toArray();
    //   const allbrandNameCar = result.filter(brandCar => brandCar.brand).filter(brandCar => brandCar.brand.toLowerCase().trim() === brandNameCar.toLowerCase().trim())
    //   res.json(allbrandNameCar)
    // });

    // loade new
    app.get("/product-details/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const product = await productsCollection.findOne(query);
      // const cursor = await productsCollection.find();
      // const result = await cursor.toArray()
      // // const product = result.filter(prod => prod._id === id)
      // console.log('========', result)
      console.log(product);
      res.json(product);
    });

    // car filter
    app.get("/products/:name", async (req, res) => {
      const brandNameCar = req.params.name;
      console.log(brandNameCar);
      // res.send('success')
      const cursor = productsCollection.find();
      const result = await cursor.toArray();
      const allBrandNameCar = result
        .filter((brandCar) => brandCar.brand)
        .filter(
          (brandCar) =>
            brandCar.brand.toLowerCase().trim() ===
            brandNameCar.toLowerCase().trim()
        );
      res.json(allBrandNameCar);
    });

    app.post("/products", async (req, res) => {
      const addNewProduct = req.body;
      // console.log(addNewProduct,"work")
      const result = await productsCollection.insertOne(addNewProduct);
      res.send(result);
    });

    //update
    app.put("/products/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const upDateProduct = req.body;
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
          category: upDateProduct.category,
          image: upDateProduct.image,
        },
      };
      const result = await productsCollection.updateOne(
        filter,
        upDateProductData,
        options
      );
      res.send(result);
    });
    // delet
    //  app.delete('/products/:id',async (req,res) =>{
    //   const id = req.params.id;
    //   const query = {_id: new ObjectId(id)}
    //   const result = await productsCollection.deleteOne(query)
    //   res.send(result);
    // })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
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
  res.send("Crud is running...");
});

app.listen(port, () => {
  console.log(`Simple Crud is Running on port ${port}`);
});
