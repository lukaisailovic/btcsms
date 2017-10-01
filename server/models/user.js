const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const blocktrail = require('blocktrail-sdk');
const client = blocktrail.BlocktrailSDK({apiKey: process.env.BLOCKTRAIL_API_KEY, apiSecret: process.env.BLOCKTRAIL_API_SECRET, network: "BTC", testnet: true});

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

module.exports = mongoose.model('User',UserSchema);
