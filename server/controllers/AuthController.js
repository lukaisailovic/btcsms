const User = require('../models/user.js');
const jwt = require('jsonwebtoken');
module.exports = {
  Authenticate,
  Register,
  GetUser
};

function Authenticate(req, res) {
  //console.log('USERNAME:' +req.body.username)
  User.findOne({
    username: req.body.username
  }, function(err, user) {
    if (err) throw err;

    if (!user) {
      res.send({ success: false, message: 'User not found.' });
    } else {
      // Check if password matches
      user.comparePassword(req.body.password, function(err, isMatch) {
        if (isMatch && !err) {
          // Create token if the password matched and no error was thrown
          var token = jwt.sign(user, process.env.JWT_SECRET, {
            expiresIn: 10080 // in seconds
          });
          res.json({ success: true, token: 'Bearer ' + token,user:user});
        } else {
          res.json({ success: false, message: 'Username and password don\'t match' });
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
      if (err) {
        res.json({ success: false , message: err});
      }
      if (!user) {
        let newUser = new User({
          username: req.body.username,
          password: req.body.password
        });

        newUser.save(function(err) {
          if (err) {
            res.json({ success: false , message: 'Could not save user'});
          }
          res.json({ success: true , message: 'Registration successfully completed. You can sign in now'});
        });


      } else {
        res.json({ success: false , message: 'That username already exists'});
      }
    });

  }
}


function GetUser(req,res) {
      //console.log('AUTH USER '+req.user);
      res.json({success:true ,user:req.user});
}
