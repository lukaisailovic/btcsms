const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const passport = require('passport');
const AuthController = require('./controllers/AuthController');
const SMSController = require('./controllers/SMSController');
const PaymentController = require('./controllers/PaymentController');
const mongoose = require('mongoose');
const sms = require('./sms.js');
const cors = require('cors');

const app = express();

console.log('Starting server');

/**
 * Helmet
 */
app.use(helmet())

/**
 * CORS
 */

app.use(cors())
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
let AuthRoutes = express.Router();

AuthRoutes.post('/register',AuthController.Register);

// Authenticate the user and get a JSON Web Token to include in the header of future requests.
AuthRoutes.post('/signin',AuthController.Authenticate );


AuthRoutes.get('/user',passport.authenticate('jwt', { session: false }),AuthController.GetUser);
// Protect dashboard route with JWT
app.get('/dashboard', passport.authenticate('jwt', { session: false }), function(req, res) {
  res.json({success:true ,message:'It worked! User id is: ' + req.user._id + '.'});
});

app.get('/sms', function (req, res) {
  sms.sendSMS();
  res.json('SMS')
})
app.post('/message/send/authenticated',passport.authenticate('jwt', { session: false }), SMSController.sendMessageAuth);
app.post('/message/send/unauthenticated', SMSController.sendMessageNotAuth);
app.post('/number/check', SMSController.checkNumber);
app.post('/number/price',SMSController.getPriceForNumber);

app.post('/order/get',PaymentController.GetOrder);
app.post('/order/check',PaymentController.CheckOrder);
app.get('/', function (req, res) {
  res.send('hello world')
})

app.use('/auth', AuthRoutes);

app.listen(3000, function () {
  console.log('App ['+process.env.APP_NAME+'] listent on port 3000')
})
