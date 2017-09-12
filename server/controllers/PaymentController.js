const sms = require('../sms.js');

const Order = require('../models/order.js');
module.exports = {
CreateOrder,
GetOrder,
CheckOrder

};


function CreateOrder(number,msgBody,price,paid) {
  let isPaid = paid == true;
  return new Promise(function(resolve, reject) {

    let NewOrder = new Order({
      price,number,msgBody,
      paid: isPaid
    });
    NewOrder.save(function(err) {

      if (err) {
        console.log('REJECTED')
      reject({ success: false , message: 'Could not save order',err});

      }

      resolve({ success: true , message: 'Order Saved', order: NewOrder});
    });



    });
}


function GetOrder(req, res) {

    Order.findOne({
      hash: req.body.hash
    },function(err,order) {
      if (err || !order) {
        res.json({success:false,message:'Could not find order'})
      } else {
        let SafeOrder = {
          number: order.number,
          price: order.price,
          btcaddress : order.btcaddress,
          paid: order.paid,
          id: order.hash,
          btcprice: order.btcprice
        };
        res.json({success:true,message: 'Order found',order:SafeOrder})
      }
    });
}


function CheckOrder(req, res) {
  Order.findOne({
    hash: req.body.hash
  },function(err,order) {
    if (err || !order) {
      res.json({success:false,message:'Could not find order',paid:null})
    } else {

      order.checkIfOrderIsPaid().then(()=>{
        console.log('THEN')

        Order.findByIdAndUpdate(order.id, { $set: { paid: true }}, { new: true }, function (err, updatedOrder) {
              let SafeOrder = {
              number: updatedOrder.number,
              price: updatedOrder.price,
              btcaddress : updatedOrder.btcaddress,
              paid: updatedOrder.paid,
              id: updatedOrder.hash,
              btcprice: updatedOrder.btcprice
            };
            sms.sendSMS(order.number,order.msgBody,updatedOrder);
            res.json({success:true,message: 'Order found',order:SafeOrder})
          });





      }).catch(()=>{
        console.log('CATCH')
        res.json({success:false,message:'Order found, but it\'s not paid yet',paid:false})
      });

    }
  });
}
