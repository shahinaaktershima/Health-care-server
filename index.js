const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app=express();
const port=process.env.PORT||5000;

// middleware
app.use(cors());
app.use(express.json());

app.get('/',(req,res)=>{
res.send('health care is running')
})



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hfsk54e.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log(uri);

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
    const userCollection=client.db('healthCare').collection('user');
     const productCollection=client.db('healthCare').collection('product');
    //  appointment collection
    app.post('/product',async(req,res)=>{
      const product=req.body;
      console.log(product);
      const result=await productCollection.insertOne(product);
      res.send(result)
    })
 app.get('/product',async(req,res)=>{
  const result=await productCollection.find().toArray();
    res.send(result);
 })
//  request aceptance
app.patch('/product/request/:id',async(req,res)=>{
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const updateDoc = {
    $set: {
      role: "confirmed",
    },
  };
  const result = await productCollection.updateOne(filter, updateDoc);
  res.send(result);
  })
app.post('/user',async(req,res)=>{
    const user=req.body;
    const query={email:user.email}
    const existingUser=await userCollection.findOne(query)
    if(existingUser){
        return res.send({message:'user already exists', insertedId:null})
    }
    const result=await userCollection.insertOne(user);
    res.send(result)
})

app.get('/user',async(req,res)=>{
    const result=await userCollection.find().toArray();
    res.send(result)
})
app.delete('/user/:id',async(req,res)=>{
    const id=req.params.id;
    const query={_id: new ObjectId(id)}
    const result=await userCollection.deleteOne(query);
    res.send(result);
  });
// admin related api
app.get('/user/admin/:email',async(req,res)=>{
  const email = req.params.email;

  const query = { email: email };
  const user = await userCollection.findOne(query);

  res.send(user);
    })
    app.patch('/user/admin/:id',async(req,res)=>{
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
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

app.listen(port,()=>{
    console.log(`health care is running on port ${port}`);
})