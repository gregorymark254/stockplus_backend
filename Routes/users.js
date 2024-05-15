const router = require('express').Router();
const { connection } = require('../Db/dbConfig');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authUser = require('../Middleware/authUser');

// register user
router.post('/register', async (req, res) => {
  const { firstName, lastName, email, phoneNumber, password } = req.body;

  // Check if email already exists
  const checkDuplicateQuery = 'SELECT * FROM users WHERE email = ?';
  connection.query(checkDuplicateQuery, [email], async (duplicateErr, duplicateResult) => {
    if (duplicateErr) {
      console.error('Error checking for duplicate email:', duplicateErr);
      res.status(500).send('Duplicate error');
      return;
    }

    if (duplicateResult.length > 0) {
      res.status(409).json({ message: 'Email already exists' });
      return;
    }

    // Generate a salt and hash the password
    const saltRounds = 10;
    try {
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Store firstName, lastName, email, phoneNumber, role and hashed password in the database
      const insertUserQuery = 'INSERT INTO users (firstName, lastName, email, phoneNumber, password) VALUES (?, ?, ?, ?, ?)';
      connection.query(insertUserQuery, [firstName, lastName, email, phoneNumber, hashedPassword], (insertErr, insertResult) => {
        if (insertErr) {
          console.error('Error executing MySQL insert query:', insertErr);
          res.status(500).send('SQL Error');
        } else {
          res.status(200).json({ message: 'Registration successful' });
        }
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Registration failed');
    }
  });
});

// login user
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
      const accessToken = jwt.sign({ firstName: user.firstName, role: user.role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
      
      res.status(200).json({ accessToken, firstName: user.firstName, role: user.role });
    } else {
      res.status(401).json({ message: 'Invalid Password' });
    }
  });
});

// get all users
router.get('/users', authUser, (req, res) => {
  const sql = 'SELECT * FROM users';
  connection.query(sql, [true], (error, results, fields) => {
    if (error) {
      console.error(error.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(results);
  });
});

// get user by id
router.get('/users/:id', authUser, (req, res) => {
  try {
    const id = req.params.id;
    const sql = 'SELECT * FROM users WHERE id = ?';

    connection.query(sql, [id], (error, results, fields) => {
      if (error) {
        console.error(error.message);
        return res.status(500).json({ error: 'Mysql fetchby id Error' });
      }
      res.json(results[0]);
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// update a user by id
router.put('/updateuser/:id', authUser, (req, res) => {
  try {
    const id = req.params.id;
    const { firstName, email, role } = req.body;

    const sql = 'UPDATE users SET firstName = ?, email = ?, role = ? WHERE id = ?';
    const data = [firstName, email, role, id];

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
router.delete('/deleteuser/:id', authUser, (req, res) => {
  try {
    const id = req.params.id;

    const sql = 'DELETE FROM users WHERE id = ?';
    const data = [id];

    connection.query(sql, data, (error, results, fields) => {
      if (error) return console.error(error.message);
      res.status(200).json({ message: 'User Deleted' });
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
