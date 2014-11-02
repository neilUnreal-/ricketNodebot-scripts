// Neil Ganotisi
// November 1, 2014
// Get your API key at http://api.wunderground.com

var request = require('request');

var apiKey = 'YOUR_API_KEY_HERE';

function generateURL(location) {
	var urlPrefix = "http://api.wunderground.com/api/" + apiKey + "/conditions/forecast/astronomy/q/";
	JSON.stringify(location);
	var searchParam = '';
	var format = '.json';

	searchParam = location.replace(/ /g, "_");

	var fullUrl = urlPrefix + searchParam + format;
	return fullUrl;
}

listen(regexFactory.startsWith("forecast"), function(match, data, replyTo, from) {

var param = '';
	param = match[1];
	JSON.stringify(param);
	var fullUrl = '';

	fullUrl = generateURL(param);

	var requestObject = {
		uri: fullUrl,
		strictSSL: false,
		timeout: 10000,
		encoding: null,
		headers: {
			'User-Agent': 'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.31 (KHTML, like Gecko) Chrome/26.0.1410.43 Safari/537.31 Nodebot'
		}
	};

	request(requestObject, function (error, response, body) {
		if(error) {
			irc.privmsg("[Forecast] Wunderground appears to be down. Sorry about that!");
		} else {
			var result = JSON.parse(body);

			if (typeof result.current_observation == "undefined" || result.current_observation.length == 0) {
				irc.privmsg(replyTo, "[Forecast] Error: Unable to load data. Either this location does not exist or you need to be more specific in your search.");
			} else {
				irc.privmsg(replyTo, "[Forecast] " + result.current_observation.observation_location.full + " : " + result.forecast.txt_forecast.forecastday[0].title + " - " + result.forecast.txt_forecast.forecastday[0].fcttext + " Sunrise at " + result.sun_phase.sunrise.hour + ":" + result.sun_phase.sunrise.minute + ". Sunset at " + result.sun_phase.sunset.hour + ":" + result.sun_phase.sunset.minute + ". " + result.current_observation.observation_time);
			}

		}
	});


});

listen(regexFactory.startsWith("weather"), function(match, data, replyTo, from) {
	var param = '';
	param = match[1];
	JSON.stringify(param);
	var fullUrl = '';


	fullUrl = generateURL(param);

	var requestObject = {
		uri: fullUrl,
		strictSSL: false,
		timeout: 10000,
		encoding: null,
		headers: {
			'User-Agent': 'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.31 (KHTML, like Gecko) Chrome/26.0.1410.43 Safari/537.31 Nodebot'
		}
	};

	request(requestObject, function (error, response, body) {
		if(error) {
			irc.privmsg("[Weather] Wunderground appears to be down. Sorry about that!");
		} else {
			var result = JSON.parse(body);

			if (typeof result.current_observation == "undefined" || result.current_observation.length == 0) {
				irc.privmsg(replyTo, "[Weather] Error: Unable to load data. Either this location does not exist or you need to be more specific in your search.");
			} else {
				irc.privmsg(replyTo, "[Weather] " + result.current_observation.observation_location.full + ": " + result.current_observation.temperature_string + ", " + result.current_observation.weather + ", " + result.current_observation.relative_humidity + " Humidity. Wind: " + result.current_observation.wind_string + ". " + result.current_observation.observation_time + ".");
			}

		}
	});

});
