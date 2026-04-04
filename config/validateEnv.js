const REQUIRED_ENV_VARS = [
	// No required vars for demo
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
