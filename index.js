require('dotenv').config(); // no use that is why no naming
const express = require('express');
const cors = require('cors')
const app = express();
const port = process.env.PORT || 3000;

//middleware

app.use(cors());
app.use(express.json());


// console.log(process.env.DB_user);
// console.log(process.env.DB_password);

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const uri = `mongodb+srv://${process.env.DB_user}:${process.env.DB_password}@cluster0.qoryues.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

        // from node mongodb crud
        const coffeeCollection = client.db("coffeeDB").collection('coffee');
        const userCollection = client.db("coffeeDB").collection('user');

        // receive data from cleint server
        app.post('/coffee', async (req, res) => {
            const newCoffee = req.body;
            console.log(newCoffee);
            const result = await coffeeCollection.insertOne(newCoffee);
            res.send(result)
        })

     


        // data read at the server
        app.get('/coffee', async (req, res) => {
            const cursor = coffeeCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })

        // update starts here////////////////// to read specific dta
        //Update Purpose: To get specific id from the database and to send it back as the response
        app.get('/coffee/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await coffeeCollection.findOne(query);
            res.send(result);
        })

        //Updating from UpdateCoffee.jsx
        app.put('/coffee/:id', async(req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedCoffee = req.body;
            const coffeeUpdate = {
                $set: {
                    name: updatedCoffee.name,
                    quantity: updatedCoffee.quantity,
                    supplier: updatedCoffee.supplier,
                    taste: updatedCoffee.taste,
                    category: updatedCoffee.category,
                    details: updatedCoffee.details,
                    photo: updatedCoffee.photo
                }
            };
           
                const result = await coffeeCollection.updateOne(filter, coffeeUpdate, options);
                res.send(result);
            
        })
        // update ends here//////////////////


        //delete
        app.delete('/coffee/:id', async(req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await coffeeCollection.deleteOne(query);
            res.send(result);

        })

        //User data post ///////////
        app.post('/user', async (req, res) => {
            const user = req.body;
            console.log(user);//to check whether the user is imported.
            const result = await userCollection.insertOne(user);
            res.send(result);
        });
        //user data read

        app.get('/user', async (req, res)=>{
            const cursor = userCollection.find();
            const users = await cursor.toArray();
            res.send(users)
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


app.get('/', (req, res) => {
    res.send('Coffee sever is running')
})
app.listen(port, () => {
    console.log(`Coffee sever is running on port: ${port}`);
})