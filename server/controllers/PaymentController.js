

const Order = require('../models/order.js');
module.exports = {
CreateOrder,
GetOrder

};


function CreateOrder(number,msgBody,price) {

  return new Promise(function(resolve, reject) {

    let NewOrder = new Order({
      price,number,msgBody
    });
    NewOrder.save(function(err) {

      if (err) {

      reject({ success: false , message: 'Could not save order',err});
      }

      resolve({ success: true , message: 'Order Saved', order: NewOrder});
    });



    });
}


function GetOrder(req, res) {
  console.log('HASH '+req.body.hash)
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
