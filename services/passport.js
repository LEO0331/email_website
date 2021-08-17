//not export anything: not capital
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const keys = require('../config/keys'); //'../config/keys.js'
const mongoose = require('mongoose');
const User = mongoose.model('users'); //fetch sth out of mongoose; require() generate duplicate access error
//https://github.com/jaredhanson/passport-google-oauth2
passport.serializeUser((user, done) => { //user: google profile/info, pass from existUser/user in accessToken callback
	done(null, user.id); //user.id: mongoID/_id
});
//req.user contains the authenticated user in passport
passport.deserializeUser((id, done) => { //id: user.id in serializeUser()
	User.findById(id).then(user => {
		done(null, user);
	});
});
//solve https issue generated by not trusting heroku proxy through change relative path or add proxy: true
passport.use(new GoogleStrategy({
    clientID: keys.GOOGLE_CLIENT_ID,
    clientSecret: keys.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback', //https://fierce-plateau-51792.herokuapp.com/auth/google/callback
    proxy: true
  },
  async (accessToken, refreshToken, profile, done) => { 
  	const existUser = await User.findOne({googleID: profile.id});
    if(existUser) return done(null, existUser);
    const user = await new User({googleID: profile.id}).save();
    done(null, user);
  }
));

/*
If the credentials are valid, the verify callback invokes done to supply Passport with the user that authenticated: done(null, user)
If the credentials are not valid (password is incorrect), done should be invoked with false instead of a user to indicate an authentication failure: done(null, false)

(accessToken, refreshToken, profile, done) => { //calback, after getting token(user info) from authRoutes
    //db.collection.findOne(query, projection)
    User.findOne({googleID: profile.id}).then(existUser => { //profile.id: googleID, only use for signin
      existUser ? done(null, existUser) : new User({googleID: profile.id}).save().then(user => done(null, user));
    });
  }
*/
