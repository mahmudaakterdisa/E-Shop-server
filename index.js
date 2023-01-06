const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

//middle wares

app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.hgitfpl.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' })
    }

    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            res.status(401).send({ message: 'unauthorized access' })
        }
        req.decoded = decoded;
        next();
    })
}


async function run() {

    try {

        const catCollection = client.db('appleuteClothing').collection('Categories');
        const cartCollection = client.db('appleuteClothing').collection('ShoppingCart');
        const userCollection = client.db('appleuteClothing').collection('users');


        //jwt
        app.post('/jwt', (req, res) => {
            const jwtUser = req.body;
            console.log(jwtUser);
            const token = jwt.sign(jwtUser, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '12d' })
            res.send({ token })
        })


        app.get('/Categories', async (req, res) => {
            const query = {}
            const cursor = catCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });

        app.get('/Categories/:name', async (req, res) => {
            const name = req.params.name;
            const query = { categories_name: (name) };
            const category = await catCollection.findOne(query);
            res.send(category);

        });


        //get your items with your specific email

        app.get('/ShoppingCart', async (req, res) => {

            let query = {};
            if (req.query.email) {

                query = {
                    email: req.query.email
                }
            }

            const cursor = cartCollection.find(query);
            const userOrders = await cursor.toArray();
            res.send(userOrders);


        });

        //post your items

        app.post('/ShoppingCart', async (req, res) => {
            const cart = req.body;

            const result = await cartCollection.insertOne(cart);
            res.send(result);
        });

        //Delete items

        app.delete('/ShoppingCart/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await cartCollection.deleteOne(query);
            res.send(result);
        });

        //Post all register user
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.send(result);
        });

        //get all users

        // get your all users
        app.get('/users', async (req, res) => {
            const query = {};
            const cursor = userCollection.find(query);
            const users = await cursor.toArray();
            res.send(users);
        });


    }
    finally {

    }
}
run().catch(err => console.error(err));


app.get('/', (req, res) => {
    res.send('E-Shop server is running')
})

app.listen(port, () => {
    console.log(`E-Shop running on ${port}`);
})