const router = require("express").Router()
const axios = require("axios")

//Genereting access token
const generateToken = async (req,res,next) => {
  const secret = process.env.MPESA_CONSUMER_SECRET
  const customer = process.env.MPESA_CONSUMER_KEY
  const auth = new Buffer.from(`${customer}:${secret}`).toString("base64")
  
  try {
    const response = await axios.get("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
      headers: {
        authorization: `Basic ${auth}`
      }
    });
    accessToken = response.data.access_token;
    next()
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

// sending stk push
router.post("/stk", generateToken , async (req, res) => {
  try {
    const phone = req.body.phone;
    const amount = req.body.amount;
    const orderId = req.body.orderId;
    const timestamp = new Date().toISOString().replace(/\D/g,'').slice(0, 14);
    const shortCode = process.env.MPESA_PAYBILL;
    const passKey = process.env.MPESA_PASSKEY;
    const password = Buffer.from(shortCode + passKey + timestamp).toString("base64");
    const callbackURL = process.env.callbackURL

    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {    
        BusinessShortCode : shortCode,    
        Password : password,    
        Timestamp : timestamp,    
        TransactionType: "CustomerPayBillOnline",
        Amount : amount,    
        PartyA : `254${phone}`,    
        PartyB : shortCode,    
        PhoneNumber : `254${phone}`,    
        CallBackURL : `${callbackURL}/${orderId}`,    
        AccountReference : "Stock Plus",    
        TransactionDesc : "Stock Plus"
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization : `Bearer ${accessToken}`
        }
      }
    );
    console.log(response.data);
    res.status(200).json(response.data);
  } catch (error) {
    console.log(error.response.data.errorMessage);
    res.status(400).json({ message: error.message }); 
  }
});

router.post("/callback/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { Body: { stkCallback } } = req.body;

    const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback;

    // Extract metadata
    const meta = Object.values(CallbackMetadata.Item);
    const PhoneNumber = meta.find(o => o.Name === 'PhoneNumber').Value.toString();
    const Amount = meta.find(o => o.Name === 'Amount').Value.toString();
    const MpesaReceiptNumber = meta.find(o => o.Name === 'MpesaReceiptNumber').Value.toString();
    const TransactionDate = meta.find(o => o.Name === 'TransactionDate').Value.toString();

    console.log("-".repeat(20), " OUTPUT IN THE CALLBACK ", "-".repeat(20));
    console.log(`
      Order_ID : ${orderId},
      MerchantRequestID : ${MerchantRequestID},
      CheckoutRequestID: ${CheckoutRequestID},
      ResultCode: ${ResultCode},
      ResultDesc: ${ResultDesc},
      PhoneNumber : ${PhoneNumber},
      Amount: ${Amount}, 
      MpesaReceiptNumber: ${MpesaReceiptNumber},
      TransactionDate : ${TransactionDate}
    `);

    // Insert payment data into database
    const sql = `INSERT INTO payments (amount, paymentMethod, orderId) VALUES (?, ?, ?)`;
    connection.query(sql, [Amount, 'Mpesa', orderId], (err, result) => {
      if (err) {
        console.error("Error creating payment:", err);
        return res.status(500).json({ error: 'Error creating payment' });
      } 

      // Update order payment status
      const updateSql = `UPDATE orders SET paymentStatus = 'paid' WHERE orderId = ?`;
      connection.query(updateSql, [orderId], (updateErr, updateResult) => {
        if (updateErr) {
          console.error("Error updating payment status:", updateErr);
          return res.status(500).json({ error: 'Error updating payment status' });
        }
        console.log("Payment created and order status updated successfully");
        res.status(200).json({ message: 'Payment created and order status updated successfully' });
      });
    });
  } catch (error) {
    console.error("Error handling callback:", error);
    res.status(503).send({
      message: "Something went wrong with the callback",
      error: error.message
    });
  }
});

  

module.exports = router