const passport = require('passport');
module.exports = app => {
	app.get(
		'/auth/google', //ask user for permission
		passport.authenticate('google', { //'google' is a property under GoogleStrategy
			scope: ['profile', 'email'] //what access we wanna have for this user profile
		})
	);

	app.get('/auth/google/callback', passport.authenticate('google'), (req, res) => { //generate accessToken(code) after permission in this middleware
		res.redirect('/surveys'); //redirect to other route handler
	}); 

	app.get('/api/current_user', (req, res) => {
		res.send(req.user); //req.user contains the authenticated user
	});

	app.get('/api/logout', (req, res) => {
		req.logout();
		res.redirect('/');
	});
};
