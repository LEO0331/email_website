//capital cuz export a class
const sendgrid = require('sendgrid');
const helper = sendgrid.mail; //const {mail} = sendgrid; mail property
const keys = require('../config/keys');
//https://github.com/sendgrid/sendgrid-nodejs/blob/f94a3924db7fd1380a341af1903955f5c526d0ba/packages/mail/USE_CASES.md
class Mailer extends helper.Mail{ //Mail object with html used inside the email body
	constructor({subject, recipients}, content){ //content: a html string
		super(); //Mail class
		this.sgApi = sendgrid(keys.sendGridKey);
		this.from_email = new helper.Email('a840331a840331@gmail.com'); 
		this.subject = subject;
		this.body = new helper.Content('text/html', content);
		this.recipients = this.formatAddresses(recipients);
		this.addContent(this.body); //inbuilt from helper base
		this.addClickTracking(); 
		this.addRecipients();
	}
	formatAddresses(recipients){ //need () to do destructure with arrow func
		return recipients.map(({email}) => {
			return new helper.Email(email);
		});
	}
	addClickTracking(){
		const trackingSettings = new helper.TrackingSettings();
		const clickTracking = new helper.ClickTracking(true, true);
		trackingSettings.setClickTracking(clickTracking);
		this.addTrackingSettings(trackingSettings);
	}
	addRecipients(){
		const personalize = new helper.Personalization();
		this.recipients.forEach(recipient => { //recipient model with helper.Email
			personalize.addTo(recipient);
		});
		this.addPersonalization(personalize);
	}
	async send(){
		try{
			const request = this.sgApi.emptyRequest({
				method: 'POST',
				path: '/v3/mail/send',
				body: this.toJSON()
			});
			const response = await this.sgApi.API(request);
			return response;
		}catch(error){
			console.log('error', error.response.body);
		}
	}
}

module.exports = Mailer;

/*
const sgMail = require("@sendgrid/mail")
const keys = require("../config/keys")
sgMail.setApiKey(keys.sendGridKey)
module.exports = async (body, subject, recipients) => {
    const msg = {
        from: keys.mailFrom,
        subject,
        text: body,
        personalizations: recipients.map(recipient => ({to: [recipient]}))
    }
    try {
        await sgMail.send(this.msg) 
    } catch (err) {
        console.error(error);
    	if (error.response) {
      	console.error(error.response.body)
    	}
    }
}

const sendMail = require("./services/Mailer")
const body = "test message"
const subject = "this is a test"
const recipients = [{email: "test1@example.com"},{email: "test2@example.com"}]
sendMail(body,subject,recipients)

class Mailer {
    constructor(survey, content){
        const {subject, recipients} = survey
        this.msg = {
            to: recipients.map(item => item.email),
            from : keys.mailFrom,
            subject,
            html: content,
            trackingSettings: {
                clickTracking: {
                  enable: true
                },
                openTracking: {
                  enable: true
                },
                subscriptionTracking: {
                  enable: true
                }
              }
            
        }
        this.send = async () => {
            try {
                const response = await sgMail.send(this.msg) //const response = this.sgApi.API(request);
                return response 
            } catch (error) {
                console.error(error)
                if (error.response){
                    console.error(error.response.body)
                }
            }
        }
    }
}
Solve Error occurred while proxying request localhost:3000/api/surveys to http://localhost:5000/ [ECONNRESET]: 
sudo lsof -i tcp:5000
kill PID
*/