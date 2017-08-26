const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

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

    }
});


/**
 * Save users hashed password
 */
UserSchema.pre('save',function(next){
    let user = this;
    if (this.isModified('password') || this.isNew) {
        let hash = bcrypt.hashSync(user.password);
        user.password = hash;
        next();
    } else {
      return next();
    }

});

/**
 * Comapre Passwords
 */
UserSchema.methods.comparePassword = function(pw,cb){
    if (!bcrypt.compareSync(pw, this.password)) {
      return cb(err);
    }
    isMatch = true;
    cb(null, isMatch);
}

module.exports = mongoose.model('User',UserSchema);
