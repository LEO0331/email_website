//return dev or prod -- NODE_ENV already built in Heroku -- NODE_ENV = 'development' -> ONLY for backend(NOT frontend)
//commonJS ALLOW to hv logic execution before what files to require in(NOT in ES6)
process.env.NODE_ENV === 'production' ? module.exports = require('./prod') : module.exports = require('./dev');
