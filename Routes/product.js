const router = require('express').Router();
const { connection } = require('../Db/dbConfig');
const authUser = require('../Middleware/authUser');

//creating a product category
/**
 * @swagger
 * /api/createcategory:
 *   post:
 *     summary: Create a new product category
 *     description: Create a new category with the provided category name.
 *     tags:
 *       - products
 *     parameters:
 *       - in: body
 *         name: categoryName
 *         description: Name of the category to be created
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             categoryName:
 *               type: string
 *     responses:
 *       '200':
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Category created successfully
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
 *                   example: Error creating category
 */
router.post('/createcategory', authUser, async (req, res) => {
    const { categoryName } = req.body;

    if (!categoryName) {
        return res.status(400).json({error: 'All fields are required'})
    }

    //insert data
    const sql = `INSERT INTO category (categoryName) VALUES (?)`;
    connection.query(sql, [categoryName], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({error: 'Error creating category'})
        } 
        res.status(200).json({message: 'category created successfully'})
    })
})


//getting all suppliers
/**
 * @swagger
 * /api/suppliers:
 *   get:
 *     summary: Get all suppliers
 *     description: Retrieve a list of all suppliers, optionally filtered by a search query, with pagination support.
 *     tags:
 *       - suppliers
 *     parameters:
 *       - in: query
 *         name: limit
 *         description: Number of suppliers to retrieve (default is 100)
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: offset
 *         description: Number of suppliers to skip (default is 0)
 *         schema:
 *           type: integer
 *           minimum: 0
 *       - in: query
 *         name: search
 *         description: Search query to filter suppliers by name
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: A list of suppliers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: Total number of suppliers matching the search criteria
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Supplier'
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
router.get('/suppliers', authUser, async (req, res) => {
    const { limit, offset, search } = req.query;
    const limitValue = parseInt(limit) || 100;
    const offsetValue = parseInt(offset) || 0;

    let sql;
    let searchValue;
    const params = [];

    if (search) {
        sql = `SELECT * FROM suppliers WHERE supplierName LIKE ? LIMIT ? OFFSET ?`;
        searchValue = `%${search}%`;
        params.push(searchValue);
    } else {
        sql = 'SELECT * FROM suppliers LIMIT ? OFFSET ?';
    }

    params.push(limitValue);
    params.push(offsetValue);

    let countSql;
    if (search) {
        countSql = 'SELECT COUNT(*) AS total FROM suppliers WHERE supplierName LIKE ?';
    } else {
        countSql = 'SELECT COUNT(*) AS total FROM suppliers';
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
            return res.status(500).json({ error: 'Failed to fetch suppliers' });
        }
        
        // Returning results along with total rows for pagination
        res.json({ total: totalRows, results: results });
        });
    });
})


//creating a supplier
/**
 * @swagger
 * /api/supplier:
 *   post:
 *     summary: Create a new supplier
 *     description: Create a new supplier with the provided details.
 *     tags:
 *       - suppliers
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               supplierName:
 *                 type: string
 *               contactPerson:
 *                 type: string
 *               contactNumber:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               address:
 *                 type: string
 *             required:
 *               - supplierName
 *               - contactPerson
 *               - contactNumber
 *               - email
 *               - address
 *     responses:
 *       '200':
 *         description: Supplier created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Supplier created successfully
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
 *                   example: Error creating supplier
 */
router.post('/supplier', authUser, async (req, res) => {
    const { supplierName, contactPerson, contactNumber, email, address } = req.body;

    if (!supplierName || !contactPerson || !contactNumber || !email || !address) {
        return res.status(400).json({error: 'All fields are required'})
    }

    //insert data
    const sql = `INSERT INTO suppliers (supplierName, contactPerson, contactNumber, email, address) VALUES (?,? ,?,?,?)`;
    connection.query(sql, [supplierName, contactPerson, contactNumber, email, address], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({error: 'Error creating supplier'})
        } 
        res.status(200).json({message: 'supplier created successfully'})
    })
})

//creating a product
/**
 * @swagger
 * /api/createproduct:
 *   post:
 *     summary: Create a new product
 *     description: Create a new product with the provided details.
 *     tags:
 *       - products
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               supplierId:
 *                 type: integer
 *               productName:
 *                 type: string
 *               productDescription:
 *                 type: string
 *               productPrice:
 *                 type: number
 *               stocklevel:
 *                 type: integer
 *               categoryId:
 *                 type: integer
 *             required:
 *               - supplierId
 *               - productName
 *               - productDescription
 *               - productPrice
 *               - stocklevel
 *               - categoryId
 *     responses:
 *       '200':
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product created successfully
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
 *                   example: Error creating product
 */
router.post('/createproduct', authUser, async (req, res) => {
    const { supplierId, productName, productDescription, productPrice, stocklevel, categoryId } = req.body;

    if (!supplierId || !productName || !productDescription || !productPrice || !stocklevel || !categoryId) {
        return res.status(400).json({error: 'All fields are required'})
    }

    //insert data
    const sql = `INSERT INTO product (supplierId, productName, productDescription, productPrice, stocklevel, categoryId) VALUES (?,?,? ,?,?,?)`;
    connection.query(sql, [supplierId, productName, productDescription, productPrice, stocklevel,categoryId], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({error: 'Error creating product'})
        } 
        res.status(200).json({message: 'Product created successfully'})
    })
})

//getting all products
/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     description: Retrieve a list of all products, optionally filtered by a search query, with pagination support.
 *     tags:
 *       - products
 *     parameters:
 *       - in: query
 *         name: limit
 *         description: Number of products to retrieve (default is 100)
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: offset
 *         description: Number of products to skip (default is 0)
 *         schema:
 *           type: integer
 *           minimum: 0
 *       - in: query
 *         name: search
 *         description: Search query to filter products by name
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: A list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: Total number of products matching the search criteria
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
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
router.get('/products', authUser, async (req, res) => {
    const { limit, offset, search } = req.query;
    const limitValue = parseInt(limit) || 100;
    const offsetValue = parseInt(offset) || 0;

    let sql;
    let searchValue;
    const params = [];

    if (search) {
        sql = `SELECT * FROM product WHERE productName LIKE ? LIMIT ? OFFSET ?`;
        searchValue = `%${search}%`;
        params.push(searchValue);
    } else {
        sql = 'SELECT * FROM product LIMIT ? OFFSET ?';
    }

    params.push(limitValue);
    params.push(offsetValue);

    let countSql;
    if (search) {
        countSql = 'SELECT COUNT(*) AS product FROM suppliers WHERE supplierName LIKE ?';
    } else {
        countSql = 'SELECT COUNT(*) AS product FROM suppliers';
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
            return res.status(500).json({ error: 'Failed to fetch products' });
        }
        
        // Returning results along with total rows for pagination
        res.json({ total: totalRows, results: results });
        });
    });
})

module.exports = router;