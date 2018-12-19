require("dotenv").config();

var keys = require("./keys.js");
var axios = require("axios");
var moment = require('moment');
    moment().format();
var spotifyWebApi = require("node-spotify-api");
var spotify = new spotifyWebApi(keys.spotify);
var fs = require("fs");


var userInput = process.argv.slice(2);
var action = userInput[0];
var item = userInput.slice(1).join(" ");


function run(action, item) {

    switch (action) {

        case "concert-this":
            // Search Bands in Town API via concert-this <artist/band name here>
            axios.get("https://rest.bandsintown.com/artists/" + item + "/events?app_id=codingbootcamp").then(function(res) {
                console.log(res.data.length);
            
                for (var i = 0; i < res.data.length; i++) {
            
                    var data = res.data[i];
                    var eventDate = moment(data.datetime).format("MM/DD/YYYY");
            
                    console.log("Venue: " + data.venue.name);
                    console.log("Location: " + data.venue.city + ", " + data.venue.country);
                    console.log("Event Date: " + eventDate + "\n");
                    console.log("----------------------------\n");

                    var resReturn = {
                        resource: "BANDS IN TOWN",
                        venue: "Venue: " + data.venue.name,
                        location: "Location: " + data.venue.city + ", " + data.venue.country,
                        date: "Event Date: " + eventDate + "\n"
                    };

                    var values = Object.values(resReturn);

                    for (var j = 0; j < values.length; j++) {
                        console.log(values[j]);
                        appendDoc(values[j]);

                        if (j === values.length - 1) {
                            console.log("Content Added!\n");
                        }
                    }
                }
            });
        break;

        case "spotify-this-song":
            // Search Spotify via spotify-this-song <song name here>
            spotify.search({type: "track", query: item, limit: 5}, function(err, res) {
            
                if (err) {
                    console.log("Error occurred: " + err);
                }
                else {
            
                    for (var i = 0; i < res.tracks.items.length; i++) {
            
                        var response = res.tracks.items[i];
            
                        console.log("Artist: " + response.artists[0].name);
                        console.log("Song: " + response.name);
                        console.log("Album: " + response.album.name);
                        console.log("Listen Here: " + response.external_urls.spotify + "\n");
                        console.log("----------------------------\n");

                        var resReturn = {
                            resource: "SPOTIFY",
                            artist: "Artist: " + response.artists[0].name,
                            song: "Song: " + response.name,
                            album: "Album: " + response.album.name,
                            listen: "Listen Here: " + response.external_urls.spotify + "\n"
                        };

                        var values = Object.values(resReturn);

                        for (var j = 0; j < values.length; j++) {
                            console.log(values[j]);
                            appendDoc(values[j]);
    
                            if (j === values.length - 1) {
                                console.log("Content Added!\n");
                            }
                        }
                    }
                }
            });
        break;

        case "movie-this":
            // Search OMDB via movie-this <movie name here>
            axios.get("http://www.omdbapi.com/?apikey=trilogy&t=" + item + "&type=movie").then(function(res) {

                var response = res.data;      
                
                console.log("Title: " + response.Title);
                console.log("Release Year: " + response.Year);
                console.log("IMDB Rating: " + response.imdbRating);

                if (response.Ratings[1] !== undefined) {
                    console.log("Rotten Tomatoes Rating: " + response.Ratings[1].Value);
                }
                
                console.log("Country Produced: " + response.Country);
                console.log("Language: " + response.Language);
                console.log("Plot: " + response.Plot);
                console.log("Actors: " + response.Actors);
                console.log("----------------------------\n");

                var resReturn = {
                    resource: "OMDB",
                    title: "Title: " + response.Title,
                    year: "Release Year: " + response.Year,
                    imdb: "IMDB Rating: " + response.imdbRating,
                    // tomatoes: "Rotten Tomatoes Rating: " + response.Ratings[1].Value,
                    language: "Language: " + response.Language,
                    plot: "Plot: " + response.Plot,
                    actors: "Actors: " + response.Actors + "\n"
                };

                var values = Object.values(resReturn);

                for (var j = 0; j < values.length; j++) {
                    appendDoc(values[j]);

                    if (j === values.length - 1) {
                        console.log("Content Added!\n");
                    }
                }
            });
        break;

        case "do-what-it-says":
            fs.readFile("random.txt", "utf8", function(err, res) {

                if (err) {
                    console.log("Error occurred: " + err);
                }
                else {
                    
                        action = res.substr(0, res.indexOf(" "));
                        item = res.substr(res.indexOf(" ") + 1);

                    run(action, item);                    
                }
            });
        break;
    }
}

function appendDoc(text) {
    
    fs.appendFile("log.txt", (text + "\n"), function(err) {

        if (err) {
            console.log("Error occurred: " + err);
        }
    });
}

run(action, item);