const BlockIo  = require('block_io');
const version = 2;
const block_io = new BlockIo(process.env.BLOCK_IO_API_KEY, process.env.BLOCK_IO_PIN, version);

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
    block_io.get_new_address({'label': order.id},function(error, data) {
      order.btcaddress = data.data.address;
      block_io.archive_address({'address': order.btcaddress}, function(error,data) {
        return next()
      });
    });
    order.hash = sha256(order.id)

    axios.get('https://blockchain.info/ticker',).then((response) => {
          let btcprice = response.data.USD.last;
          order.btcprice = Math.round (order.price/btcprice * 100000000) / 100000000;
        }).catch((err)=>{});

});




module.exports = mongoose.model('Order',OrderSchema);
