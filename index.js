const express = require('express');
const cors = require('cors');

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

require('dotenv').config();

const jwt = require('jsonwebtoken');

const port = process.env.PORT || 5000;



const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);




const app = express();

// middleware
app.use(cors());
app.use(express.json());


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

        const categoryCollection = client.db("SellCell").collection("category");

        const bookedProductCollection = client.db("SellCell").collection("booked");

        const reportProductCollection = client.db("SellCell").collection("report");


        const paymentsCollection = client.db("SellCell").collection("payments");


        // const advertiseCollection = client.db('SellCell').collection('advertise');


        /* User */
        // Post a User
        app.post("/user", async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.send(result);
        });

        // Update a User
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

        // Get All User
        // http://localhost:5000/user

        app.get("/user", async (req, res) => {
            const query = {};
            const users = await userCollection.find(query).toArray();
            res.send(users);
        });


        // delete a user
        app.delete("/user/:id", async (req, res) => {
            const id = req.params.id;
            // console.log(id);
            const query = { _id: ObjectId(id) };
            const result = await userCollection.deleteOne(query);
            res.send(result);
        });

        // Get User Role
        // http://localhost:5000/user/a@a.com

        app.get("/user/seller/:email", async (req, res) => {
            const email = req.params.email;
            // console.log(email);
            const query = { email };
            const user = await userCollection.findOne(query);
            // console.log(user);
            res.send({ isSeller: user?.role === 'Seller' });
        });


        // Get Admin Role
        app.get("/user/admin/:email", async (req, res) => {
            const email = req.params.email;
            // console.log(email);
            const query = { email };
            const user = await userCollection.findOne(query);
            // console.log(user);
            res.send({ isAdmin: user?.role === 'Admin' });
        });

        /*  */

        // err

        // Get seller or buyer
        app.get("/allUsers/:role", async (req, res) => {
            const role = req.params.role;
            const query = { role: role };
            const result = await userCollection.find(query).toArray();
            res.send(result);
        });

        /*  */

        // Get User Verified
        app.put("/user/verify/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    verify: "true",
                },
            };
            const result = await userCollection.updateOne(
                filter,
                updatedDoc,
                options
            );
            res.send(result);
        });



        /* Category */

        // Get All Category
        // http://localhost:5000/category

        app.get("/category", async (req, res) => {
            const query = {};
            const result = await categoryCollection.find(query).toArray();
            res.send(result);
        });


        // http://localhost:5000/brand?Brand=Nokia

        // app.get("/brand", async (req, res) => {
        //   const Brand = req.query.Brand;
        // console.log(Brand);
        //   const query = { Brand };
        //   const result = await productCollection.find(query).toArray();
        //   res.send(result);
        // });


        // Get a category collection
        app.get("/category/:category_name", async (req, res) => {
            const category_name = req.params.category_name;
            // console.log(category_name);
            const query = { category_name: category_name };
            const result = await productCollection.find(query).toArray();
            // console.log(result);
            res.send(result);
        });

        /* Product */
        // Post a product
        app.post("/products", async (req, res) => {
            const product = req.body;
            // console.log(product);
            const result = await productCollection.insertOne(product);
            res.send(result);
        });

        // Get All Products
        app.get("/products", async (req, res) => {
            const query = {};
            const result = await productCollection.find(query).toArray();
            res.send(result);
        });

        // get my Product
        // app.get("/dashboard/myProduct", async (req, res) => {
        //   const email = req.query.email;
        //   console.log(email);
        //   const query = { email };
        //   const result = await productCollection.find(query).toArray();
        //   res.send(result);
        // });

        // err
        // Get My product
        // http://localhost:5000/dashboard/myProduct?email=razibulislam665@gmail.com
        app.get("/dashboard/myProduct", async (req, res) => {
            const email = req.query.email;
            const query = { userEmail: email };
            // console.log(query);
            const result = await productCollection.find(query).toArray();
            res.send(result);
        });


        // app.delete("/products/:id", async (req, res) => {
        //   const id = req.params.id;
        //   const query = { _id: ObjectId(id) };
        //   const service = await productCollection.deleteOne(query);
        //   res.send(service);
        // });

        // Delete a product
        app.delete("/products/:id", async (req, res) => {
            const id = req.params.id;
            // console.log(id);
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.send(result);
        });

        // Add Booked Product

        app.post('/bookProduct', async (req, res) => {
            const product = req.body;
            // console.log(product);


            const query = {
                productId: product.productId,
                email: product.email

            }

            const alreadyBooked = await bookedProductCollection.find(query).toArray();

            if (alreadyBooked.length) {
                const message = `You already have a booking for ${product.productName}`
                return res.send({ acknowledged: false, message })
            }


            const result = await bookedProductCollection.insertOne(product);
            res.send(result);
        });



        /* orders */

        /* My Orders */
        app.get("/orders", async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const bookings = await bookedProductCollection.find(query).toArray();
            res.send(bookings);
        });

        // Delete a Order
        app.delete("/orders/:id", async (req, res) => {
            const id = req.params.id;
            // console.log(id);
            const query = { _id: ObjectId(id) };
            const result = await bookedProductCollection.deleteOne(query);
            res.send(result);
        });


        /* Report */

        // Add Report Product
        app.post("/reports", async (req, res) => {
            const product = req.body;
            // console.log(product);
            const result = await reportProductCollection.insertOne(product);
            res.send(result);
        });

        // Get Report
        app.get("/reports", async (req, res) => {
            const query = {};
            const result = await reportProductCollection.find(query).toArray();
            res.send(result);
        });

        // Delete A Report
        app.delete("/reports/:id", async (req, res) => {
            const id = req.params.id;
            // console.log(id);
            const query = { _id: ObjectId(id) };
            const result = await reportProductCollection.deleteOne(query);
            res.send(result);
        });



        // /*  */

        // Payments Orders
        app.get("/orders/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const orders = await bookedProductCollection.findOne(query);
            res.send(orders);
        });

        // create-payment-intent
        app.post("/create-payment-intent", async (req, res) => {
            const orders = req.body;
            const price = orders.resalePrice;
            const amount = price * 100;

            const paymentIntent = await stripe.paymentIntents.create({
                currency: "usd",
                amount: amount,
                payment_method_types: ["card"],
            });
            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        });

        //payments
        app.post("/payments", async (req, res) => {
            const payment = req.body;
            const result = await paymentsCollection.insertOne(payment);
            const id = payment.bookingId;
            const filter = { _id: ObjectId(id) };
            const updatedDoc = {
                $set: {
                    paid: true,
                    transactionId: payment.transactionId,
                },
            };
            const updatedResult = await bookedProductCollection.updateOne(
                filter,
                updatedDoc
            );
            res.send(result);
        });





        // /*  */


        /*  */

        // advertise



        app.get('/myAdvertise/:advertise', async (req, res) => {
            const advertise = req.params.advertise;
            const query = { advertise: advertise };
            const data = productCollection.find(query)
            const result = await data.toArray()
            res.send(result);
        });

        // update ad
        app.put('/myAdvertise/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    advertise: 'true'
                }
            }
            const result = await productCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        });

        // remove ad
        app.put("/myAdvertiseRemove/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    advertise: "false",
                },
            };
            const result = await productCollection.updateOne(
                filter,
                updatedDoc,
                options
            );
            // console.log("remove");
            res.send(result);
        });


        // sold product

        // Product sold status set
        app.put("/soldProduct/sold/:id", async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const filter = { _id: ObjectId(id) };
            const option = { upsert: true };
            const updatedDoc = {
                $set: {
                    // report: true,
                    sold: true,
                    advertise: 'false',
                },
            };
            const result = await productCollection.updateOne(
                filter,
                updatedDoc,
                option
            );
            res.send(result);
        });


    }


    finally {

    }
}



run().catch((err) => console.error(err));



app.get('/', async (req, res) => {
    res.send('ast-12-sellcell server is running');
})

app.listen(port, () => console.log(`ast-12-sellcell running on ${port}`))


