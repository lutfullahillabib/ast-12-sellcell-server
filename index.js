const express = require('express');
const cors = require('cors');

const { MongoClient, ServerApiVersion } = require('mongodb');

const jwt = require('jsonwebtoken');


// 


const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// 

app.get('/', async (req, res) => {
    res.send('ast-12-sellcell server is running');
})

app.listen(port, () => console.log(`ast-12-sellcell running on ${port}`))


