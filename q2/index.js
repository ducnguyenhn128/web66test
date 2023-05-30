const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken')

const secretkey = "fh3quehfaushf39284hfashf24qhfaesfhoipfh"
mongoose.connect("mongodb://127.0.0.1:27017")
const db = mongoose.connection.useDb('store');
const app = express();
app.use(bodyParser.json())

const orderSchema = {
  item: {type: String},
  price: {type: Number},
  quantity: {type: Number}
}

const inventorySchema = {
  sku: {type: String},
  description: {type: String},
  instock: {type: Number}
}

const userSchema = {
  username: {type: String},
  password: {type: String}
}

const orderModel = db.model('orders', orderSchema)
const inventoryModel = db.model('inventories', inventorySchema)
const userModel = db.model('users', userSchema)

// 4. login api
app.post('/login', async (req, res) => {
  const {username, password} = req.body;
  try {
    const foundUser = await userModel.findOne({username: username, password: password})
    if (foundUser) {
      const payload = {username}
      const token = jwt.sign(payload, secretkey);
      res.status(200).send(token)
    } else {
      res.status(404).send('User not found')
    }
  } catch(err) {
    console.log(err)
  }
})

// 5. authentication
const authentication = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1]
  
  if(!token) {
    res.status(401).send('No token')
  }
  try {
    const decoded = jwt.verify(token, secretkey)
    console.log(decoded)
    next();
  } catch (err) {
    res.status(401).send("Invalid token");
  }

}
app.use(authentication)

// 2. Write an api endpoint for that getting all products in inventory
app.get('/all-products', async (req, res) => {
  const data = await inventoryModel.find({})
  const allProducts = data.map(el => el.sku)
  res.status(200).json(allProducts)
})

// 3. Update the API to accept a query for getting only products that have low quantity (less than 100). (2 Points)
app.get('/low-quantity' , async(req, res) => {
  const data = await inventoryModel.find({instock: {$lt: 100}})
  res.status(200).send(data)
})

//6. Create an API for getting orders with the description of product inside each orders. (1 Points)
app.get('/all-order', async (req, res) => {
  const allOrders = await orderModel.find().lean();
  await Promise.all(
      allOrders.map( async (order) => {
        const item = order.item
        const product = await inventoryModel.find({sku:item}).lean()
        order.description = product[0].description
      })
  )
    
    res.status(200).json(allOrders)
})

app.listen(3000, () => {
  console.log("App is running at 3000");
  // connectToDb();
});
