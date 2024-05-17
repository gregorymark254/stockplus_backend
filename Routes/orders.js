const router = require('express').Router();
const { connection } = require('../Db/dbConfig');
const authUser = require('../Middleware/authUser');


router.post("/orders", authUser, async (req,res) => {
    const { orderDate, amount, userId } = req.body;

    if (!orderDate || !amount || !userId) {
        return res.status(400).json({error: "All fields are required"})
    }

    const sql = `INSERT INTO orders (orderDate,amount,userId) VALUES (?,?,?)`;
    connection.query(sql, [orderDate,amount,userId], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({error: 'Error creating order'})
        } 
        res.status(200).json({message: 'order created successfully'})
    })
})

router.post("/orderdetails", authUser, async (req,res) => {
    const { quantity, price, productId, orderId } = req.body;
    if (!quantity || !price || !productId || !orderId) {
        return res.status(400).json({error: "All fields are required"})
    }

    const sql = `INSERT INTO orderDetails (quantity, price, productId, orderId) VALUES (?,?,?,?)`;
    connection.query(sql, [quantity, price, productId, orderId], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({error: 'Error creating order'})
        } 
        res.status(200).json({message: 'order details created successfully'})
    })
})


module.exports = router