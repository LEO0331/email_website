const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

class Mailer {
	constructor({ subject, recipients }, htmlContent) {
		this.subject = subject;
		this.recipients = recipients; // Array of email strings
		this.htmlContent = htmlContent;
		this.from = process.env.MAIL_FROM || 'noreply@example.com';
	}

	async send() {
		// Skip if no API key configured
		if (!process.env.RESEND_API_KEY) {
			console.log('Resend API key not configured. Email not sent.');
			return { success: false, message: 'Email service not configured' };
		}

		try {
			// Send email to all recipients
			const response = await resend.emails.send({
				from: this.from,
				to: this.recipients,
				subject: this.subject,
				html: this.htmlContent,
			});

			console.log('Email sent successfully:', response);
			return response;
		} catch (error) {
			console.error('Error sending email:', error);
			throw error;
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