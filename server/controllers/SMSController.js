const sms = require('../sms.js');
const User = require('../models/user.js');
const phone = require('phone');
const PaymentController = require('./PaymentController');
module.exports = {
  checkNumber,
  getPriceForNumber,
  sendMessageAuth,
  sendMessageNotAuth

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

function sendMessageAuth(req,res) {
  if (req.body.number == null || req.body.number == "" || req.body.body == null || req.body.body == "") {
    res.json({success:false,message:'Please provide number and message body'})
  } else {
    if (req.user.balance < req.body.price) {
      res.json({success:false,message:'You don\'t have enough money in your account'})
    } else {
      let newbalance = req.user.balance - req.body.price;
      User.findByIdAndUpdate(req.user.id, { $set: { balance: newbalance }}, { new: true }, function (err, doc) {
            PaymentController.CreateOrder(req.body.number,req.body.body,req.body.price,true).then((response)=>{
            sms.sendSMS(response.order.number,response.order.msgBody,response.order);
            res.json({success:true,message: 'Order Created',order: response.order})
          }).catch((err)=>{
            res.json({success:false,message: 'Order is not created'})
          });
        });

    }

  }
}
function sendMessageNotAuth(req,res) {
  if (req.body.number == null || req.body.number == "" || req.body.body == null || req.body.body == "") {
    res.json({success:false,message:'Please provide number and message body'})
  } else {

    // sms.sendSMS(req.body.number,req.body.body)
      PaymentController.CreateOrder(req.body.number,req.body.body,req.body.price).then((response)=>{
        console.log('TRUE')
      res.json({success:true,message: 'Order Created',order: response.order})
    }).catch((err)=>{
        console.log('FALSE')
      res.json({success:false,message: 'Order is not created'})
    });
  }
}
