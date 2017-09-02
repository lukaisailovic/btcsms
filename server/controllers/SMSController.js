const sms = require('../sms.js');
const phone = require('phone');
module.exports = {
  checkNumber,
  getPriceForNumber

};

function checkNumber(req,res) {

    if (req.body.number == null || req.body.number == "") {
      res.json({success:false,message:'Number not provided'})
    } else {
      if (sms.checkNumber(req.body.number)) {
        res.json({success:true,message: 'Number is valid'})
      } else {
        res.json({success:false,message:'Number is not valid'})
      }

    }

}

function getPriceForNumber(req,res) {
  if (req.body.number == null || req.body.number == "") {
    res.json({success:false,message:'Number not provided'})
  } else {
    if (sms.checkNumber(req.body.number)) {

      sms.getPrice(req.body.number).then((price)=>{
        res.json({success:true,message: 'Price fetched successfully',price: price*1.8})
      }).catch((err)=>{
        res.json({success:false,message: 'Could not get price'})
      });


    } else {
      res.json({success:false,message:'Number is not valid'})
    }

  }
}
