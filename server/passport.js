var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var User = require('./models/user');


// Setup work and export for the JWT passport strategy
module.exports = function(passport) {
  var opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = process.env.JWT_SECRET;
  passport.use(new JwtStrategy(opts, function(jwt_payload, done) {

    User.findOne({username: jwt_payload._doc.username}, function(err, user) {
      if (err) {
        return done(err, false);
      }
      if (user) {
      
        done(null, user);
      } else {
        console.log('USER NOT FOUND')
        done(null, false);
      }
    });
  }));
};
