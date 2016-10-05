var express = require('express');
var http = require('http');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient
var lineReader = require('line-reader');
var URL = 'mongodb://localhost:27017/test'
var APIKEY = 'ab396c8c6739406ccc15fcfb13190288';
var request = require('request');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Home - CarboWeb' });
});

router.get('/getCityWeather', function(req, res, next) {
	
	console.log('Citta cercata: ' + req.query.name );
	MongoClient.connect(URL, function(err, db) {
	  if (err) return;   
		
		var collection = db.collection('cities');
		var regexp = '^' + req.query.name + '$';
		collection.findOne({'name': {$regex: regexp, $options: 'i' }}, function(err, doc){
			if(err) return;
						
			if (!doc) {
				res.render('index', { title: 'Home - CarboWeb', forecast: null });

			} else {
				console.log('Risultato query db: ' + doc.name + ' -> ' + doc.id);
				requestWeather(doc.id, res);
				
				// res.render('index', { title: 'Home - CarboWeb', body: JSON.stringify(b,null,4) });
			}
		});

		db.close();	
	});
});

module.exports = router;

function requestWeather(cityID,res){
	var url = 'http://api.openweathermap.org/data/2.5/forecast?APPID=' + APIKEY 
			+ '&id=' + cityID + '&units=metric&lang=en';

	var opt = {
		host: 'api.openweathermap.org',
		path: 'data/2.5/forecast?APPID=' + APIKEY 
			+ '&id=' + cityID + '&units=metric&lang=it'
	};
	console.log(opt.host + opt.path +'\nAltri dati ' + cityID + ' ' + APIKEY);

	request(url, function (error, response, body) {
  		if (!error && response.statusCode == 200) {
    		console.log("Risposta da " + url);
    		
    		var weather = JSON.parse(body).list;
			for(var i in weather)
				console.log(weather[i].weather);


    		res.render('index', { title: 'Home - CarboWeb', forecast: weather });
  		}
	});

	return;
}



function loadCitiesIDfromFile(URLDB, pathToFile){

	MongoClient.connect(URLDB, function(err, db) {
	  if (err) return;  

		var pathToFile = pathToFile || 'city.list.json';
		var collection = db.collection('cities');
		var cities = [], city = {}; city.coord = {};
		lineReader.eachLine(pathToFile, function(line, last) {
			var split = line.split('"');
		  city.id = parseInt(split[2].slice(1).slice(0,-1), 10);
			city.name = split[5];
		  city.country = split[9];
		  city.coord.lon = parseFloat(split[14].slice(1).slice(0,-1));
		  city.coord.lat = parseFloat(split[16].slice(1).slice(0,-4));
		  cities.push(city);    
		  console.log(city + '\nProcessate ' + cities.length + ' citta' ); 
		  city = {}; city.coord = {};        
		      
			if (last) {
		    collection.insertMany(cities, function(err, result) {
		    	console.log(err);
		    	console.log(result.result.n + ' totali inserite ' + result.ops.length);
		    	db.close();
		    });
			}  
		});
	});
}
