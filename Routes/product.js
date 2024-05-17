const router = require('express').Router();
const { connection } = require('../Db/dbConfig');
const authUser = require('../Middleware/authUser');

//creating a product
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

//creating a product
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

module.exports = router;