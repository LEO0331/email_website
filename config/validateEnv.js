const REQUIRED_ENV_VARS = [
	'GOOGLE_CLIENT_ID',
	'GOOGLE_CLIENT_SECRET',
	'MONGO_URI',
	'COOKIE_KEY',
	'STRIPE_PUBLISHABLE_KEY',
	'STRIPE_SECRET_KEY',
	'SEND_GRID_KEY',
	'DOMAIN'
];

module.exports = function validateEnv() {
	if (process.env.SKIP_ENV_VALIDATION === 'true') {
		return;
	}

	const missing = REQUIRED_ENV_VARS.filter((name) => {
		const value = process.env[name];
		return typeof value !== 'string' || value.trim() === '';
	});

	if (missing.length > 0) {
		const message = [
			'Missing required environment variables:',
			...missing.map((name) => `- ${name}`),
			'',
			'Copy .env.example to .env and fill in real values before starting the server.'
		].join('\n');

		throw new Error(message);
	}
};
