var _ = require('lodash');
global._ = _; //When doing ._ calls lodash, defined globally
const {Path} = require('path-parser'); //const Path = require('path-parser').default;
const {URL} = require('url');
const requireLogin = require('../middlewares/requireLogin');
const requireCredits = require('../middlewares/requireCredits');
const mongoose = require('mongoose'); //https://mongoosejs.com/docs/guide.html
const Mailer = require('../services/Mailer');
const surveyTemplate = require('../services/surveyTemplate');
const Survey = mongoose.model('surveys');

module.exports = app => {
	app.get('/api/surveys/', requireLogin, async (req, res) => { //fetch user survey and put them on dashboard; reach out db is an async request
		const surveys = await Survey.find({_user: req.user.id}).select({recipients: false}); //select specific data
		res.send(surveys);
	});

	app.get('/api/surveys/:surveyId/:choice', (req, res) => {
		res.send('Thanks for voting!!!');
	});

	app.post('/api/surveys/webhooks', (req, res) => { //extract only ID, choices from URL
		const p = new Path('/api/surveys/:surveyId/:choice');
		_.chain(req.body)
			.map(({email, url}) => { 
				const match = p.test(new URL(url).pathname);
				if (match){
					return {email, surveyId: match.surveyId, choice: match.choice}
				}
			})
			.compact() //remove undefined elements after mapping
			.uniqBy('email', 'surveyId')
			.each(({surveyId,email,choice}) => { //update record in db
	      		Survey.updateOne({
	         		_id: surveyId,
	         		recipients: {
	            		$elemMatch: {email: email, responded: false}
	        		}}, {
	            		$inc :  {[choice] :  1},
	            		$set: {'recipients.$.responded' : true},
	            		lastResponded: new Date() //$currentDate: { lastResponded: true }
	        		}
	        	).exec();
	   		})
			.value();
		res.send({});
	});

	app.post('/api/surveys', requireLogin, requireCredits, async (req, res) => {
		const {title, subject, body, recipients} = req.body;
		const survey = new Survey({ //new instance of survey
			title, //title: title
			subject,
			body,
			recipients: recipients.split(',').map(email => ({email: email.trim()})),
			_user: req.user.id, //generate auto on mongoose model
			dateSent: Date.now()
		});
		//Mailer(subject/recipients, content/body of the email in html)
		const mailer = new Mailer(survey, surveyTemplate(survey)); //send an email
		try {
      		await mailer.send();
      		await survey.save();
      		req.user.credits -= 1;
      		const user = await req.user.save();
      		res.send(user);
    	} catch (error) {
      		res.status(422).send(error);
    	}
	});
};

/*
app.post('/api/surveys/webhooks', (req, res) => {
	const events = _.map(req.body, ({email, url}) => { 
		const pathname = new URL(url).pathname;
		const p = new Path('/api/surveys/:surveyId/:choice');
		const match = p.test(pathname);
		if (match){
			return {email, surveyId: match.surveyId, choice: match.choice}
		}
	});
	const compactEvents = _.compact(events); 
	const uniqueEvents = _.uniqBy(compactEvents, 'email', 'surveyId');
});
*/