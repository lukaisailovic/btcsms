const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./models/user.js');

const app = express();

console.log('Starting server');

/**
 * Helmet
 */
app.use(helmet())
/**
 * body-parser
 */
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/**
 * Use Passport
 */
app.use(passport.initialize());

// Use password strategy
require('./passport.js')(passport);

/**
 * Database
 */
mongoose.connect(process.env.DATABASE_URL);

/**
 * Routes
 */

let apiRoutes = express.Router();
apiRoutes.post('/register',function(req,res) {
  if (!req.body.username || !req.body.password) {
    res.json({ success: false , message: 'Please populate all fields'});
  } else {
    let newUser = new User({
      username: req.body.username,
      password: req.body.password
    });

    newUser.save(function(err) {
      if (err) {
        console.log(err)
        res.json({ success: false , message: 'That username already exists'});
      }
      res.json({ success: true , message: 'Successfully created new user'});
    });
  }
});




// Authenticate the user and get a JSON Web Token to include in the header of future requests.
apiRoutes.post('/authenticate', function(req, res) {
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
          res.json({ success: true, token: 'JWT ' + token });
        } else {
          res.send({ success: false, message: 'Authentication failed. Passwords did not match.' });
        }
      });
    }
  });
});

// Protect dashboard route with JWT
apiRoutes.get('/dashboard', passport.authenticate('jwt', { session: false }), function(req, res) {
  res.send('It worked! User id is: ' + req.user._id + '.');
});

app.get('/', function (req, res) {
  res.send('hello world')
})
app.use('/api', apiRoutes);

app.listen(3000, function () {
  console.log('App ['+process.env.APP_NAME+'] listent on port 3000')
})
