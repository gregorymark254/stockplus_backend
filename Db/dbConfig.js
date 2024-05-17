// connection to mysql database
const mysql = require('mysql');

const connection = mysql.createPool({
  host: process.env.MYSQL_ADDON_HOST,
  port: process.env.MYSQL_ADDON_PORT,
  user: process.env.MYSQL_ADDON_USER,
  password: process.env.MYSQL_ADDON_PASSWORD,
  database: process.env.MYSQL_ADDON_DB,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0 
});

const sqlconnect = () => {
  connection.getConnection((err, conn) => {
    if (err) {
      console.error('Error connecting to Stockplus database:', err.message);
    } else {
      console.log('Connected to Stockplus database.');
    }
  });
};



module.exports = { connection, sqlconnect };
git remote add clever git+ssh://git@push-n3-par-clevercloud-customers.services.clever-cloud.com/app_cc18737e-26d4-4f7f-afbd-bb295d03ff4e.git
git push clever master