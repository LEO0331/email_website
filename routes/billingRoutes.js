//https://stripe.com/docs/api/charges/create
const keys = require('../config/keys');
const stripe = require('stripe')(keys.stripeSecretKey);//stripeSecretKey: a token representing the charge after payment
const requireLogin = require('../middlewares/requireLogin');

module.exports = app => {
	app.post('/api/stripe', requireLogin, async (req, res) => {
		const charge = await stripe.charges.create({
  			amount: 500,
  			currency: 'usd',
  			source: req.body.id,
  			description: '$5 for 5 credits'
		});
		//after passport.initialize()/.session(), generate current user model as req.user
		req.user.credits += 5;
		const user = await req.user.save();
		res.send(user);
	});
};
