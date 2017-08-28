const User = require('../models/user.js');
const jwt = require('jsonwebtoken');
module.exports = {
  Authenticate,
  Register
};

function Authenticate(req, res) {

  User.findOne({
    username: req.body.username
  }, function(err, user) {
    if (err) throw err;

    if (!user) {
      res.send({ success: false, message: 'Authentication failed. User not found.' });
    } else {
      // Check if password matches
      user.comparePassword(req.body.password, function(err, isMatch) {
        if (isMatch && !err) {
          // Create token if the password matched and no error was thrown
          var token = jwt.sign(user, process.env.JWT_SECRET, {
            expiresIn: 10080 // in seconds
          });
          res.json({ success: true, token: 'Bearer ' + token });
        } else {
          res.json({ success: false, message: 'Authentication failed. Passwords did not match.' });
        }
      });
    }
  });

} // end of authenticate

function Register(req,res) {
  if (!req.body.username || !req.body.password) {
    res.json({ success: false , message: 'Please populate all fields'});
  } else {
    User.findOne({
      username:req.body.username
    },function(err,user) {
      if (err) throw err;
      if (!user) {
        let newUser = new User({
          username: req.body.username,
          password: req.body.password
        });

        newUser.save(function(err) {
          if (err) {
            console.log(err)
            res.json({ success: false , message: 'Could not save user'});
          }
          res.json({ success: true , message: 'Successfully created new user'});
        });


      } else {
        res.json({ success: false , message: 'That username already exists'});
      }
    });

  }
}
