const router = require('express').Router();
const { connection } = require('../Db/dbConfig');
const authUser = require('../Middleware/authUser');

router.post('/payment', authUser, async (req,res) => {
    const { amount, paymentMethod, paymentDate, orderId } = req.body;

    if (!amount || !paymentMethod || !paymentDate || !orderId) {
        return res.status(400).json('All fields are required')
    }

    const sql = `INSERT INTO payments(amount,paymentMethod,paymentDate,orderId) values(?,?,?,?)`;
    connection.query(sql, [amount,paymentMethod,paymentDate,orderId], (err,result) =>{
        if (err) {
            console.log(err);
            return res.status(500).json({error: 'Error while saving payment'})
        }
        return res.status(200).json({message: 'Payment saved successfully'})
            
    })
})

module.exports = router