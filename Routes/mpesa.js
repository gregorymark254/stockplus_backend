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
 
  const phone = req.body.phone;
  const amount = req.body.amount;
  const timestamp = new Date().toISOString().replace(/\D/g,'').slice(0, 14);
  const shortCode = process.env.MPESA_PAYBILL;
  const passKey = process.env.MPESA_PASSKEY;
  const password = Buffer.from(shortCode + passKey + timestamp).toString("base64");

  await axios.post(
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
      CallBackURL : process.env.callbackURL,    
      AccountReference : "Stock Plus",    
      TransactionDesc : "Stock Plus"
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization : `Bearer ${accessToken}`
      }
    }
  )
  .then((data) => {
    console.log(data.data)
    res.status(200).json(data.data)
  })
  .catch((err) => {
    console.log(err.message)
  })
});


router.post("/callback", (req, res) => {
  const callbackData = req.body;
  console.log(
    "INFO",
    `\nINFO:M-PESA STK PUSH RESULTS,\nMerchantRequestID:${callbackData.Body.stkCallback.MerchantRequestID},\nCheckoutRequestID:${callbackData.Body.stkCallback.CheckoutRequestID},\nResultCode:${callbackData.Body.stkCallback.ResultCode},\nResultDescription:${callbackData.Body.stkCallback.ResultDesc}`
  );
  console.log(callbackData)

  if (callbackData.Body.stkCallback.CallbackMetadata) {
    const items = callbackData.Body.stkCallback.CallbackMetadata.Item;
    const values = items.map((item) => item.Value);
    console.log(
      "INFO",
      `\nINFO:M-PESA STK PUSH RESULTS,\nAmount:${values[0]},\nMpesaReceiptNumber:${values[1]},\nTransactionDate:${values[3]},\nPhoneNumber:${values[4]}`
    );
  }

  const MerchantRequestID = callbackData.Body.stkCallback.MerchantRequestID;
  const safaricomResponse = callbackData.Body.stkCallback.ResultDesc;
  console.log(MerchantRequestID)
  console.log(safaricomResponse)

});

  

module.exports = router