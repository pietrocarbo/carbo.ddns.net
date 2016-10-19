var mongoose = require('mongoose');
var citySchema = new mongoose.Schema({
	coord: {
		lon: Number,
		lat: Number,
	},
	id: Number,
	name: String,
	country: String
});

var City = mongoose.model('City', citySchema, 'citiesList');

module.exports = City;