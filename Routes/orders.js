const router = require('express').Router();
const { connection } = require('../Db/dbConfig');
const authUser = require('../Middleware/authUser');


//create a new order
/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     description: Create a new order with the provided details.
 *     tags:
 *       - orders
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderDate:
 *                 type: string
 *                 format: date
 *               amount:
 *                 type: number
 *               userId:
 *                 type: integer
 *             required:
 *               - orderDate
 *               - amount
 *               - userId
 *     responses:
 *       '200':
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order created successfully
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
 *                   example: Error creating order
 */
router.post("/orders", authUser, async (req,res) => {
    const { userId, productId, quantity, amount } = req.body;

    if (!userId || !productId || !quantity || !amount) {
        return res.status(400).json({error: "All fields are required"})
    }

    const sql = `INSERT INTO orders (userId, productId, quantity, amount) VALUES (?,?,?,?)`;
    connection.query(sql, [userId, productId, quantity, amount], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({error: 'Error creating order'})
        } 
        res.status(200).json({message: 'order created successfully'})
    })
})

//getting all orders
/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders
 *     description: Retrieve a list of all orders, optionally filtered by a search query, with pagination support.
 *     tags:
 *       - orders
 *     parameters:
 *       - in: query
 *         name: limit
 *         description: Number of orders to retrieve (default is 100)
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: offset
 *         description: Number of orders to skip (default is 0)
 *         schema:
 *           type: integer
 *           minimum: 0
 *       - in: query
 *         name: search
 *         description: Search query to filter orders by orderId
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: A list of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: Total number of orders matching the search criteria
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
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
router.get('/orders', authUser, async (req, res) => {
    const { limit, offset, search } = req.query;
    const limitValue = parseInt(limit) || 100;
    const offsetValue = parseInt(offset) || 0;

    let sql;
    let searchValue;
    const params = [];

    if (search) {
        sql = `SELECT * FROM orders WHERE orderId LIKE ? LIMIT ? OFFSET ?`;
        searchValue = `%${search}%`;
        params.push(searchValue);
    } else {
        sql = 'SELECT * FROM orders LIMIT ? OFFSET ?';
    }

    params.push(limitValue);
    params.push(offsetValue);

    let countSql;
    if (search) {
        countSql = 'SELECT COUNT(*) AS total FROM orders WHERE orderId LIKE ?';
    } else {
        countSql = 'SELECT COUNT(*) AS total FROM orders';
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
            return res.status(500).json({ error: 'Failed to fetch orders' });
        }
        
        // Returning results along with total rows for pagination
        res.json({ total: totalRows, results: results });
        });
    });
})

//getting all orders details by userid
/**
 * @swagger
 * /api/orders/{userId}:
 *   get:
 *     summary: Get all orders details by user ID
 *     description: Retrieve all orders associated with a specific user based on the user ID.
 *     tags:
 *       - orders
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID of the user
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         description: Limit the number of orders returned
 *         schema:
 *           type: integer
 *       - in: query
 *         name: offset
 *         description: Offset for pagination
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         description: Search query to filter orders by product ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of orders.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: Total number of orders.
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *       500:
 *         description: Failed to fetch user orders.
 */
router.get('/orders/:userId', authUser, async (req, res) => {
    const id = req.params.userId;
    const { limit, offset, search } = req.query;
    const limitValue = parseInt(limit) || 100;
    const offsetValue = parseInt(offset) || 0;

    let sql;
    let searchValue;
    const params = [];

    if (search) {
        sql = `SELECT * FROM orders WHERE productId LIKE ? LIMIT ? OFFSET ?`;
        searchValue = `%${search}%`;
        params.push(searchValue);
    } else {
        sql = 'SELECT * FROM orders where userId = ? LIMIT ? OFFSET ?';
        params.push(id);
    }

    params.push(limitValue);
    params.push(offsetValue);

    let countSql;
    if (search) {
        countSql = 'SELECT COUNT(*) AS total FROM orders WHERE productId LIKE ?';
    } else {
        countSql = 'SELECT COUNT(*) AS total FROM orders where userId = ?';
        params.push(id);
    }
    

    // Execute count query to get total rows
    connection.query(countSql, [id, searchValue], (countErr, countResults) => {
        if (countErr) {
        console.error(countErr.message);
        return res.status(500).json({ error: 'Failed to get total' });
        }

        const totalRows = countResults[0].total;

        // Execute main query to fetch data with search condition
        connection.query(sql, params, (error, results) => {
        if (error) {
            console.error(error.message);
            return res.status(500).json({ error: 'Failed to fetch user orders' });
        }
        
        // Returning results along with total rows for pagination
        res.json({ total: totalRows, results: results });
        });
    });
})

module.exports = router