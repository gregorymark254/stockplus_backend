const router = require('express').Router();
const { connection } = require('../Db/dbConfig');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authUser = require('../Middleware/authUser');
const authorize = require('../Middleware/authorize')
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

// register user
/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Register a new user
 *     description: Register a new user with provided details.
 *     tags:
 *       - auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Registration successful
 *       400:
 *         description: Bad request or invalid data
 *       409:
 *         description: Email already exists
 */
router.post('/register', async (req, res) => {
  const { firstName, lastName, email, phoneNumber, password } = req.body;

  // Check if email already exists
  const checkDuplicateQuery = 'SELECT * FROM users WHERE email = ?';
  connection.query(checkDuplicateQuery, [email], async (duplicateErr, duplicateResult) => {
    if (duplicateErr) {
      console.error(duplicateErr);
      res.status(500).send('Duplicate error');
      return;
    }

    if (duplicateResult.length > 0) {
      res.status(409).json({ message: 'Email already exists' });
      return;
    }

    // Generate a salt and hash the password
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Store firstName, lastName, email, phoneNumber, role and hashed password in the database
    const insertUserQuery = 'INSERT INTO users (firstName, lastName, email, phoneNumber, password) VALUES (?, ?, ?, ?, ?)';
    connection.query(insertUserQuery, [firstName, lastName, email, phoneNumber, hashedPassword], (insertErr, insertResult) => {
      if (insertErr) {
        console.error(insertErr);
        res.status(500).send('Failed to register');
      } else {
        res.status(200).json({ message: 'Registration successful' });
      }
    });
  });
});

// login user
/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Login user
 *     description: Login user with provided email and password.
 *     tags:
 *       - auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Bad request or invalid data
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const getUserQuery = 'SELECT * FROM users WHERE email = ?';
  connection.query(getUserQuery, [email], async (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).json({ message: 'MySql login error' });
      return;
    }

    if (!results.length) {
      res.status(400).json({ message: 'Invalid Email' });
      return;
    }

    const user = results[0];
    const isValid = await bcrypt.compare(password, user.password);
    if (isValid) {
      // Generate JWT tokens
      const accessToken = jwt.sign({ email: user.email, role: user.role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
      
      res.status(200).json({ accessToken, userId: user.userId, firstName: user.firstName, lastName: user.lastName, role: user.role });
    } else {
      res.status(401).json({ message: 'Invalid Password' });
    }
  });
});

//Send otp
router.post('/forgotpassword', async (req, res) => {
  try {
    const { msisdn } = req.body;
    const getUser = `SELECT * FROM users WHERE phoneNumber = ?`;
    
    connection.query(getUser, [msisdn], async (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).json({ message: 'MySql login error' });
        return;
      }
  
      if (!results.length) {
        res.status(400).json({ message: 'Number not found' });
        return;
      }

      // Generate OTP
      let digits = '0123456789';
      let OTP = '';
      for (let i = 0; i < 4; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
      }

      // Check if OTP already exists for the phone number
      const checkExistingOTPQuery = 'SELECT * FROM otp WHERE phoneNumber = ?';
      connection.query(checkExistingOTPQuery, [msisdn], async (err, results) => {
        if (err) {
          console.log(err);
          res.status(500).json({ message: 'Error checking existing OTP in database' });
          return;
        }

        if (results.length) {
          // Update existing OTP
          const updateOTPQuery = 'UPDATE otp SET otp = ? WHERE phoneNumber = ?';
          connection.query(updateOTPQuery, [OTP, msisdn], async (err, result) => {
            if (err) {
              console.log(err);
              res.status(500).json({ message: 'Error updating OTP in database' });
              return;
            }
            // Send OTP via Twilio
            try {
              await client.messages.create({
                from: process.env.TWILIO_PHONE_NUMBER,
                to: `+254${msisdn}`,
                body: `Your OTP code is ${OTP}`
              });
              res.status(200).json({ message: `OTP updated and sent to +254${msisdn}` });
            } catch (error) {
              console.log(error);
              res.status(500).json({ message: 'Error sending OTP via Twilio' });
            }
          });
        } else {
          // Insert new OTP
          const insertOTPQuery = 'INSERT INTO otp (otp, phoneNumber) VALUES (?, ?)';
          connection.query(insertOTPQuery, [OTP, msisdn], async (err, result) => {
            if (err) {
              console.log(err);
              res.status(500).json({ message: 'Error inserting OTP into database' });
              return;
            }
            // Send OTP via Twilio
            try {
              await client.messages.create({
                from: process.env.TWILIO_PHONE_NUMBER,
                to: `+254${msisdn}`,
                body: `Your OTP code is ${OTP}`
              });
              res.status(200).json({ message: `OTP sent to +254${msisdn}` });
            } catch (error) {
              console.log(error);
              res.status(500).json({ message: 'Error sending OTP via Twilio' });
            }
          });
        }
      });
    });
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

//reset password
router.post('/resetpassword', async (req, res) => {
  try {
    const { phoneNumber, otp, password } = req.body;

    // Check if OTP matches the one stored in the database
    const checkOTPQuery = 'SELECT * FROM otp WHERE phoneNumber = ? AND otp = ?';
    connection.query(checkOTPQuery, [phoneNumber, otp], async (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).json({ message: 'Database error' });
        return;
      }

      if (!results.length) {
        res.status(400).json({ message: 'Invalid OTP' });
        return;
      }

    // If OTP is valid, update the user's password
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
      const updatePasswordQuery = 'UPDATE users SET password = ? WHERE phoneNumber = ?';
      connection.query(updatePasswordQuery, [hashedPassword, phoneNumber], async (err, result) => {
        if (err) {
          console.log(err);
          res.status(500).json({ message: 'Error updating password' });
          return;
        }

        res.status(200).json({ message: 'Password reset successful' });
      });
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: 'An error occurred' });
  }
});




// get all users
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve all users from the database.
 *     tags:
 *      - users
 *     responses:
 *       200:
 *         description: A list of users
 *       500:
 *         description: Internal server error
 */
router.get('/users', authUser, authorize(['admin']), (req, res) => {
  const { limit, offset, search } = req.query;
  const limitValue = parseInt(limit) || 100;
  const offsetValue = parseInt(offset) || 0;

  let sql;
  let searchValue;
  const params = [];

  if (search) {
    sql = `SELECT * FROM users WHERE email LIKE ? ORDER BY createdAt DESC LIMIT ? OFFSET ?`;
    searchValue = `%${search}%`;
    params.push(searchValue);
  } else {
    sql = 'SELECT * FROM users ORDER BY createdAt DESC LIMIT ? OFFSET ?';
  }

  params.push(limitValue);
  params.push(offsetValue);

  let countSql;
  if (search) {
    countSql = 'SELECT COUNT(*) AS total FROM users WHERE email LIKE ?';
  } else {
    countSql = 'SELECT COUNT(*) AS total FROM users';
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
        return res.status(500).json({ error: 'Failed to fetch users' });
      }
      
      // Returning results along with total rows for pagination
      res.json({ total: totalRows, results: results });
    });
  });
});

// get user by id
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve all users from the database with optional filtering and pagination.
 *     tags:
 *       - users
 *     parameters:
 *       - in: query
 *         name: limit
 *         description: Number of items to return per page.
 *         schema:
 *           type: integer
 *           default: 100
 *       - in: query
 *         name: offset
 *         description: Number of items to skip.
 *         schema:
 *           type: integer
 *           default: 0
 *       - in: query
 *         name: search
 *         description: Search string to filter users by email.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: A list of users with total count and pagination info.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: Total number of users matching the search criteria.
 *                 results:
 *                   type: array
 *       '500':
 *         description: Internal server error
 */
router.get('/users/:id', authUser, (req, res) => {
  const id = req.params.id;
  const sql = 'SELECT * FROM users WHERE userId = ?';

  connection.query(sql, [id], (error, results, fields) => {
    if (error) {
      console.error(error.message);
      return res.status(500).json({ error: 'Mysql fetchby id Error' });
    }
    res.json(results[0]);
  });
});

// update a user by id
/**
 * @swagger
 * /api/updateuser/{id}:
 *   put:
 *     summary: Update user by ID
 *     description: Update user details by their ID.
 *     tags:
 *       - users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user to update.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Bad request or invalid data
 *       500:
 *         description: Internal server error
 */
router.put('/updateuser/:id', authUser, (req, res) => {
  try {
    const id = req.params.id;
    const { firstName, lastName, phoneNumber, role } = req.body;

    const sql = 'UPDATE users SET firstName = ?, lastName = ?, phoneNumber = ?, role = ? WHERE userId = ?';
    const data = [firstName, lastName, phoneNumber, role, id];

    connection.query(sql, data, (error, results, fields) => {
      if (error) return console.error(error.message);
      res.status(200).json({ message: 'User Updated' });
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
});

// delete a user by id
/**
 * @swagger
 * /api/deleteuser/{id}:
 *   delete:
 *     summary: Delete user by ID
 *     description: Delete a user by their ID.
 *     tags:
 *       - users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user to delete.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Bad request or invalid data
 *       500:
 *         description: Internal server error
 */
router.delete('/deleteuser/:id', authUser, (req, res) => {
  const id = req.params.id;
  const sql = 'DELETE FROM users WHERE userId = ?';
  const data = [id];

  connection.query(sql, data, (error, results) => {
    if (error) {
      console.error(error.message);
      return res.status(500).json({ error: 'Failed to delete user' });
    }
    res.send('File deleted successfully');
  });
});

module.exports = router;
