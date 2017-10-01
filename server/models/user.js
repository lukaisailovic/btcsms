const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const blocktrail = require('blocktrail-sdk');
const client = blocktrail.BlocktrailSDK({apiKey: process.env.BLOCKTRAIL_API_KEY, apiSecret: process.env.BLOCKTRAIL_API_SECRET, network: "BTC", testnet: true});
const axios = require('axios');
/**
 * User Schema
 */

const UserSchema = new mongoose.Schema({
    username:{
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
    lastCredited: {
      type: Number,
      default: 0,
    },
    btcaddress:{
      type: String,
    },
});


/**
 * Save users hashed password
 */
UserSchema.pre('save',function(next){
    let user = this;
    if (this.isModified('password') || this.isNew) {
        let hash = bcrypt.hashSync(user.password);
        user.password = hash;

        // chcek if there is an BTC address, if not create one
        if (user.btcaddress == null) {
          client.initWallet(process.env.BLOCKTRAIL_WALLET_ID,process.env.BLOCKTRAIL_WALLET_PASS,
          function(err, wallet) {
            wallet.getNewAddress(function(err, address) {
              if (err) {
                console.log(err)
              } else {
                console.log('BTC ADDRESS OF '+user.username+' SHOULD BE'+address)
                user.btcaddress = address;
                next();
              }

            });
          });

        } else {
          return next();
        }

    } else {
      return next();
    }




});

/**
 * Comapre Passwords
 */
UserSchema.methods.comparePassword = function(pw,cb){
    if (!bcrypt.compareSync(pw, this.password)) {
      isMatch = false;
      cb(true, isMatch);
    } else {
      isMatch = true;
      cb(null, isMatch);
    }

}


UserSchema.methods.checkIfBalanceIsUpdated = function checkIfBalanceIsUpdated () {
  let that = this;
  return new Promise(function(resolve, reject) {
    client.address(that.btcaddress,
    function(err, address) {

      if (err) {
        reject()
      } else {
        let addressBalance = blocktrail.toBTC(address.received);
        console.log(addressBalance - that.lastCredited)
        if (addressBalance > that.lastCredited ) {
            let balanceDifference = addressBalance - that.lastCredited;
            let newBalance = that.balance + balanceDifference
              axios.get('https://blockchain.info/ticker',).then((response) => {
                let btcprice = response.data.USD.last;
                console.log('SHOULD UPDATE USER BALANCE TO '+balanceDifference*btcprice+' AND LAST CREDITED TO ' +addressBalance)
                let newBalance = that.balance + balanceDifference*btcprice
                //order.btcprice = Math.round (order.price/btcprice * 100000000) / 100000000;
                let payload = {
                  newBalance: newBalance,
                  addressBalance: addressBalance
                }
                resolve(payload)
              }).catch((err)=>{});

        } else {
          reject()
        }
      }

     });

  });
};

module.exports = mongoose.model('User',UserSchema);
