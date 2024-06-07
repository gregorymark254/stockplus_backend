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
    const timestamp = new Date().toISOString().replace(/\D/g,'').slice(0, 14);
    const shortCode = process.env.MPESA_PAYBILL;
    const passKey = process.env.MPESA_PASSKEY;
    const password = Buffer.from(shortCode + passKey + timestamp).toString("base64");

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
    );
    console.log(response.data);
    res.status(200).json(response.data);
  } catch (error) {
    console.log(error.response.data.errorMessage);
    res.status(400).json({ message: error.message }); 
  }
});


router.post("/callback", (req, res) => {
  const callbackData = req.body;

  // Log the callback data to the console
  console.log(callbackData);

  if (!callbackData.Body.stkCallback.CallbackMetadata) {
    console.log(callbackData.Body)
    return res.status(200).json("OK")
}
console.log(callbackData.Body.stkCallback.CallbackMetadata)
res.status(200)
});

  

module.exports = router