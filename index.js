const express = require('express'); 
const mongoose = require('mongoose');
const cookieSession = require('cookie-session'); //cookie to manage passport
const passport = require('passport');
const keys = require('./config/keys'); 
require('./models/User'); //order matters
require('./models/Survey');
require('./services/passport');

mongoose.connect(keys.mongoURI, { //resolve dependency warnings in deploy to Heroku
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
 });

const app = express();
//https://stackoverflow.com/questions/23259168/what-are-express-json-and-express-urlencoded
app.use(express.json()); 
//使用 app.use() 和 app.METHOD() 函數，將應用程式層次的中介軟體連結至 app object 實例
app.use(cookieSession({
	maxAge: 30 * 24 * 60 * 60 * 1000,//how long can this cookie remain inside a browser before auto expire in milsec
	keys: [keys.cookieKey] //encrypt
}));
app.use(passport.initialize()); //use cookie to handle authentication
app.use(passport.session());
//require('./routes/authRoutes')(app);
const autoRoutes = require('./routes/authRoutes');
autoRoutes(app);
require('./routes/billingRoutes')(app);
require('./routes/surveyRoutes')(app);

if(process.env.NODE_ENV === 'production'){
	//express will serve up production assests like our main.js/main.css 
	app.use(express.static('client/build')); //https://expressjs.com/zh-tw/starter/static-files.html
	//express will serve up index.html in client if it does not recognize routes in server 
	const path = require('path');
	app.get('*', (req, res) => {
		res.sendFile(path.resolve(__dirname,'client','build','index.html'));
	});
}

const PORT = process.env.PORT || 5000; //Logical OR: when expr1 is falsy, return expr2
app.listen(PORT); //Dynamic Port Binding
