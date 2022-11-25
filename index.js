const express = require('express');
const cors = require('cors');

const { MongoClient, ServerApiVersion } = require('mongodb');

const jwt = require('jsonwebtoken');

require('dotenv').config();

// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

//

console.log(process.env.DB_USER);
console.log(process.env.DB_PASS);


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jjkmnej.mongodb.net/?retryWrites=true&w=majority`;

console.log(uri);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// function verifyJWT(req, res, next) {

//     const authHeader = req.headers.authorization;
//     if (!authHeader) {
//         return res.status(401).send('unauthorized access');
//     }

//     const token = authHeader.split(' ')[1];

//     jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
//         if (err) {
//             return res.status(403).send({ message: 'forbidden access' })
//         }
//         req.decoded = decoded;
//         next();
//     })

// }


async function run() {
    try {

        const userCollection = client.db("SellCell").collection("user");
        const productCollection = client.db("SellCell").collection("product");



        // User
        app.post("/user", async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.send(result);
        });


        app.put("/user", async (req, res) => {
            const email = req.body.email;
            const data = req.body;
            const query = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: data.name,
                    email: data.email,
                    photoURL: data.photoURL,
                    role: data.role,
                    verify: data.verify,
                },
            };
            const result = await userCollection.updateOne(query, updateDoc, options);
            res.send(result);
        });


        // http://localhost:5000/user
        app.get("/user", async (req, res) => {
            const query = {};
            const users = await userCollection.find(query).toArray();
            res.send(users);
        });



    }


    finally {

    }
}

run().catch(console.log);



// 

app.get('/', async (req, res) => {
    res.send('ast-12-sellcell server is running');
})

app.listen(port, () => console.log(`ast-12-sellcell running on ${port}`))


