// Prefer local `dev.js` in development, but gracefully fall back to env-based config.
if (process.env.NODE_ENV === 'production') {
	module.exports = require('./prod');
} else {
	try {
		module.exports = require('./dev');
	} catch (error) {
		module.exports = require('./prod');
	}
}
