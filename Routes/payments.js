const router = require('express').Router();
const { connection } = require('../Db/dbConfig');
const authUser = require('../Middleware/authUser');

// making a payment
/**
 * @swagger
 * /api/payment:
 *   post:
 *     summary: Make a payment
 *     description: Make a payment for an order with the provided details.
 *     tags:
 *       - payments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               paymentMethod:
 *                 type: string
 *               paymentDate:
 *                 type: string
 *                 format: date
 *               orderId:
 *                 type: integer
 *             required:
 *               - amount
 *               - paymentMethod
 *               - paymentDate
 *               - orderId
 *     responses:
 *       '200':
 *         description: Payment saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Payment saved successfully
 *       '400':
 *         description: Bad request. Required fields are missing.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: All fields are required
 *       '500':
 *         description: Internal server error occurred.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error while saving payment
 */

router.post('/payment', authUser, async (req,res) => {
    const { amount, paymentMethod, orderId } = req.body;

    if (!amount || !paymentMethod || !orderId) {
        return res.status(400).json('All fields are required')
    }

    const sql = `INSERT INTO payments (amount,paymentMethod,orderId) values(?,?,?)`;
    connection.query(sql, [amount,paymentMethod,orderId], (err,result) =>{
        if (err) {
            console.log(err);
            return res.status(500).json({error: 'Error while saving payment'})
        }
        return res.status(200).json({message: 'Payment saved successfully'})
    })
})

//getting all payments
/**
 * @swagger
 * /api/payments:
 *   get:
 *     summary: Get all payments
 *     description: Retrieve a list of all payments, optionally filtered by a search query, with pagination support.
 *     tags:
 *       - payments
 *     parameters:
 *       - in: query
 *         name: limit
 *         description: Number of payments to retrieve (default is 100)
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: offset
 *         description: Number of payments to skip (default is 0)
 *         schema:
 *           type: integer
 *           minimum: 0
 *       - in: query
 *         name: search
 *         description: Search query to filter payments by paymentId
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: A list of payments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: Total number of payments matching the search criteria
 *                 results:
 *                   type: array
 *       '500':
 *         description: Internal server error occurred.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get('/payments', authUser, async (req, res) => {
    const { limit, offset, search } = req.query;
    const limitValue = parseInt(limit) || 100;
    const offsetValue = parseInt(offset) || 0;

    let sql;
    let searchValue;
    const params = [];

    if (search) {
        sql = `SELECT * FROM payments WHERE paymentId LIKE ? ORDER BY paymentDate DESC LIMIT ? OFFSET ?`;
        searchValue = `%${search}%`;
        params.push(searchValue);
    } else {
        sql = `select paymentId, payments.orderId,payments.amount,paymentMethod,paymentDate,phoneNUmber
                from payments 
                INNER JOIN orders ON payments.orderId = orders.orderId
                INNER JOIN users on orders.userId = users.userId 
                ORDER BY paymentDate DESC LIMIT ? OFFSET ?`;
    }

    params.push(limitValue);
    params.push(offsetValue);

    let countSql;
    if (search) {
        countSql = 'SELECT COUNT(*) AS total FROM payments WHERE paymentId LIKE ?';
    } else {
        countSql = 'SELECT COUNT(*) AS total FROM payments';
    }
    

    // Execute count query to get total rows
    connection.query(countSql, [searchValue], (countErr, countResults) => {
        if (countErr) {
        console.error(countErr.message);
        return res.status(500).json({ error: 'Failed to get total' });
        }

        const totalRows = countResults[0].total;

        // Execute main query to fetch data with search condition
        connection.query(sql, params, (error, results) => {
        if (error) {
            console.error(error.message);
            return res.status(500).json({ error: 'Failed to fetch payments' });
        }
        
        // Returning results along with total rows for pagination
        res.json({ total: totalRows, results: results });
        });
    });
})

module.exports = router