const { Resend } = require('resend');

class Mailer {
	constructor({ subject, recipients }, htmlContent) {
		this.subject = subject;
		this.recipients = recipients;
		this.htmlContent = htmlContent;
		this.from = process.env.MAIL_FROM || 'noreply@example.com';
	}

	async send() {
		if (!process.env.RESEND_API_KEY) {
			return { success: false, message: 'Email service not configured' };
		}

		try {
			const resend = new Resend(process.env.RESEND_API_KEY);

			const response = await resend.emails.send({
				from: this.from,
				to: this.recipients,
				subject: this.subject,
				html: this.htmlContent,
			});

			return response;
		} catch (error) {
			console.error('Error sending email:', error);
			throw error;
		}
	}
}

module.exports = Mailer;
