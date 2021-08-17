const mongoose = require('mongoose');
//object destructuring: extract properties from objects and bind them to variables
const {Schema} = mongoose; //const Schema = mongoose.Schema -> https://dmitripavlutin.com/javascript-object-destructuring/#1-the-need-for-object-destructuring
const userSchema = new Schema({
	googleID: String,
	credits: {type: Number, default: 0}
});
//https://mongoosejs.com/docs/models.html
mongoose.model('users', userSchema); //name of collection, create a new collection
