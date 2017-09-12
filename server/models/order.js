
const blocktrail = require('blocktrail-sdk');
const client = blocktrail.BlocktrailSDK({apiKey: process.env.BLOCKTRAIL_API_KEY, apiSecret: process.env.BLOCKTRAIL_API_SECRET, network: "BTC", testnet: true});

const mongoose = require('mongoose');
const sha256 = require('js-sha256');
const axios = require('axios');

/**
 * User Schema
 */

const OrderSchema = new mongoose.Schema({
      hash:{
        type: String,
      },
      price:{
        type: Number,
        required: true,
      },
      number:{
        type: String,
        required: true,
      },
      msgBody:{
        type: String,
        required: true,
      },
      sent:{
        type: Boolean,
        default: false,
      },
      btcaddress:{
        type: String,
        default: null,
      },
      paid:{
        type: Boolean,
        default: false,
      },
      btcprice:{
        type: Number,
      }

});

OrderSchema.pre('save',function(next){
    let order = this;
    if (order.btcaddress == null) {

      client.initWallet(process.env.BLOCKTRAIL_WALLET_ID,process.env.BLOCKTRAIL_WALLET_PASS,
      function(err, wallet) {
        wallet.getNewAddress(function(err, address) {
          order.btcaddress = address;
          order.hash = sha256(order.id)
          axios.get('https://blockchain.info/ticker',).then((response) => {
                let btcprice = response.data.USD.last;
                order.btcprice = Math.round (order.price/btcprice * 100000000) / 100000000;
                return next();
              }).catch((err)=>{});
        });
      });

    }

});

OrderSchema.methods.checkIfOrderIsPaid = function checkIfOrderIsPaid () {
  let that = this;
  return new Promise(function(resolve, reject) {

    client.address(that.btcaddress,
    function(err, address) {

      if (err) {
        reject()
      } else {
        console.log('BALANCE  '+blocktrail.toBTC(address.balance))
        if (blocktrail.toBTC(address.balance) >= that.btcprice) {
          resolve()
        } else {
          reject()
        }
      }

     });



  });
};


module.exports = mongoose.model('Order',OrderSchema);
