// Neil Ganotisi
// November 1, 2014
// Grab the API key from http://xboxapi.com
// Possible Security Conflict: XboxAPI requires an active Microsoft Account login with your UID/Pass. 
// I suggest creating a throwaway Microsoft account for this service.

var request = require('request');

var apiKey = 'YOUR_API_KEY_HERE'

function generatePresenceURL(gamertag) {
	JSON.stringify(gamertag);
	var url = "https://xboxapi.com/v2/" + gamertag + "/presence";
	console.log(url);
	return url;

}

function generateGamercardURL(gamertag) {
	JSON.stringify(gamertag);
	var url = "https://xboxapi.com/v2/" + gamertag + "/gamercard";
	console.log(url);
	return url;
}


listen(regexFactory.startsWith("xinfo"), function(match, data, replyTo, from) {
	var gamertag = '';
	gamertag = match[1];
	JSON.stringify(gamertag);
	var url = '';

	fullUrl = generateGamercardURL(gamertag);

	var requestObject = {
		uri: fullUrl,
		strictSSL: false,
		timeout: 10000,
		encoding: null,
		headers: {
			'User-Agent': 'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.31 (KHTML, like Gecko) Chrome/26.0.1410.43 Safari/537.31 Nodebot',
			'X-AUTH': apiKey
		}
	};

	request(requestObject, function (error, response, body) {
			if(error) {
				irc.privmsg(replyTo, "[XBL] API appears to be down. Sorry about that.");
			} else {
				console.log("retrieval success!");
				var result = JSON.parse(body);
				console.log(result);

			if (typeof result.gamertag == "undefined" || result.gamertag.length === 0) {
				irc.privmsg(replyTo, "[XBL] Error: Unable to load data. Does this Gamertag exist?");
			} else if (result.gamertag.length > 0) {
				irc.privmsg(replyTo, "[XBL] Gamertag: " + result.gamertag + " | Name: " + result.name + " | Location: " + result.location + " | Gamerscore: " + result.gamerscore + " | Silver/Gold?: " + result.tier + " | Motto: " + result.motto + " | Bio: " + result.bio);
			} else {
				irc.privmsg(replyTo, "[XBL] An error occured. Go ahead and try again!");
			}
		}
	});
});


listen(regexFactory.startsWith("xstatus"), function(match, data, replyTo, from) {
	var gamertag = '';
	gamertag = match[1];
	JSON.stringify(gamertag);
	var url = '';

	fullUrl = generatePresenceURL(gamertag);

	var requestObject = {
		uri: fullUrl,
		strictSSL: false,
		timeout: 10000,
		encoding: null,
		headers: {
			'User-Agent': 'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.31 (KHTML, like Gecko) Chrome/26.0.1410.43 Safari/537.31 Nodebot',
			'X-AUTH': apiKey
		}
	};

	request(requestObject, function (error, response, body) {
		if(error) {
			irc.privmsg(replyTo, "[XBL] API appears to be down. Sorry about that.");
		} else {
			console.log("retrieval success!");
			var result = JSON.parse(body);
			console.log(result);

			if (typeof result.state == "undefined" || result.state.length === 0) {
				irc.privmsg(replyTo, "[XBL] Error: Unable to load data. Does this Gamertag exist?");
			} else if (result.state == "Offline" && (typeof result.lastSeen == "undefined" || result.lastSeen.length == 0)) {
				irc.privmsg(replyTo, "[XBL] " + gamertag + " is Offline. There is no saved previous activity (The user may have set their account private).");
			} else if (result.state == "Offline") {
				var lastTitle = result.lastSeen.titleName;

				if (result.lastSeen.deviceType == "XboxOne") {
					var device = "Xbox One";
				} else if (result.lastSeen.deviceType == "Xbox360") {
					var device = "Xbox 360";
				}

				if (lastTitle == "Home" && device == "Xbox One") {
					irc.privmsg(replyTo, "[XBL] " + gamertag + " is Offline. Last seen on the Xbox One's Home screen.");
				} else {
					irc.privmsg(replyTo, "[XBL] " + gamertag + " is Offline. Last seen on " + device + " playing " + lastTitle + ".");
				}
			} else if ((result.state == "Online" || result.state == "Away" || result.state == "Busy") && result.devices[0].type == "XboxOne") {
				if (result.devices[0].titles[0].name == "Home" && typeof result.devices[0].titles[1] == "undefined") {
					console.log("1");
					irc.privmsg(replyTo, "[XBL] " + gamertag + " is " + result.state + ". Currently on Xbox One at the Home screen.");
				} else if (result.devices[0].titles[1].name == "Home" && result.devices[0].titles[2].name.length > 0) {
					console.log("2");
					irc.privmsg(replyTo, "[XBL] " + gamertag + " is " + result.state + ". Currently on Xbox One playing " + result.devices[0].titles[0].name + " (" + result.devices[0].titles[0].activity.richPresence + ") " + "with the " + result.devices[0].titles[2].name + " app snapped in the background.");
				} else if (result.devices[0].titles[0].placement == "Background" && result.devices[0].titles[1].name.length > 0 && typeof result.devices[0].titles[2] !== "undefined") {
					console.log("3");
					if (typeof result.devices[0].titles[2].activity !== "undefined") {
						irc.privmsg(replyTo, "[XBL] " + gamertag + " is " + result.state + ". Currently on Xbox One playing " + result.devices[0].titles[1].name + " (" + result.devices[0].titles[1].activity.richPresence + ") " + "with the " + result.devices[0].titles[2].name + " (" + result.devices[0].titles[2].activity.richPresence + ") app snapped in the background.");
					} else {
						irc.privmsg(replyTo, "[XBL] " + gamertag + " is " + result.state + ". Currently on Xbox One playing " + result.devices[0].titles[1].name + " (" + result.devices[0].titles[1].activity.richPresence + ") " + "with the " + result.devices[0].titles[2].name + " app snapped in the background.");
					}
				} else {
					console.log("4");
					if (typeof result.devices[0].titles[1].activity == 'undefined' || result.devices[0].titles[1].activity === 0){
						irc.privmsg(replyTo, "[XBL] " + gamertag + " is " + result.state + ". Currently on Xbox One playing " + result.devices[0].titles[1].name + " .");
					} else {
						irc.privmsg(replyTo, "[XBL] " + gamertag + " is " + result.state + ". Currently on Xbox One playing " + result.devices[0].titles[1].name + " (" + result.devices[0].titles[1].activity.richPresence + ").");
					}
				}
			} else if ((result.state == "Online" || result.state == "Away" || result.state == "Busy") && result.devices[0].type == "Xbox360") {
				irc.privmsg(replyTo, "[XBL] " + gamertag + " is " + result.state + ". Currently on Xbox 360 playing " + result.devices[0].titles[0].name + ".");
			} else {
				irc.privmsg(replyTo, "[XBL] An error occured. Go ahead and try again!");
			}
		}
	});
});
