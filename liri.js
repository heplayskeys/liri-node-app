require("dotenv").config();

var keys = require("./keys.js");
var axios = require("axios");
var moment = require('moment');
    moment().format();
var spotifyWebApi = require("node-spotify-api");
var spotify = new spotifyWebApi(keys.spotify);
var fs = require("fs");


// Gather command line input for subsequent "run" function
var userInput = process.argv.slice(2);
var action = userInput[0];
var item = userInput.slice(1).join(" ");

// Increment used for calling "appendDoc" function
var j = 0;


// Conditional check for command line input -- if none, defaults are used, where applicable
if (action === "spotify-this-song" && item === "") {

    item = "ace of base the sign";
    run(action, item);
}
else if (action === "movie-this" && item === "") {

    item = "mr nobody";
    run(action, item);
}
else {

    run(action, item);
}


function run(action, item) {

    switch (action) {

        case "concert-this":
            // Search Bands in Town API via concert-this <artist/band name here> -- date range applied to reduce results
            axios.get("https://rest.bandsintown.com/artists/" + item + "/events?date=2019-01-01,2019-02-28&app_id=codingbootcamp").then(function(res) {
            
                if (j < res.data.length) {
            
                    var data = res.data[j];
                    var eventDate = moment(data.datetime).format("MM/DD/YYYY");
            
                    console.log("Venue: " + data.venue.name);
                    console.log("Location: " + data.venue.city + ", " + data.venue.country);
                    console.log("Event Date: " + eventDate);
                    console.log("----------------------------\n");

                    var resReturn = {
                        resource: "BANDS IN TOWN",
                        venue: "Venue: " + data.venue.name,
                        location: "Location: " + data.venue.city + ", " + data.venue.country,
                        date: "Event Date: " + eventDate + "\n"
                    };

                    var values = Object.values(resReturn);

                    appendDoc(values, 0);
                    j++;
                    run(action, item);
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
            
                    if (j < res.tracks.items.length) {
            
                        var response = res.tracks.items[j];
            
                        console.log("Artist: " + response.artists[0].name);
                        console.log("Song: " + response.name);
                        console.log("Album: " + response.album.name);
                        console.log("Listen Here: " + response.external_urls.spotify);
                        console.log("----------------------------\n");

                        var resReturn = {
                            resource: "SPOTIFY",
                            artist: "Artist: " + response.artists[0].name,
                            song: "Song: " + response.name,
                            album: "Album: " + response.album.name,
                            listen: "Listen Here: " + response.external_urls.spotify + "\n"
                        };

                        var values = Object.values(resReturn);

                        appendDoc(values, 0);
                        j++;
                        run(action, item);
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

                // Conditional check to include Rotten Tomatoes rating, if available -- else, omit the rating
                if (response.Ratings[1] !== undefined) {
                    var resReturn = {
                        resource: "OMDB",
                        title: "Title: " + response.Title,
                        year: "Release Year: " + response.Year,
                        imdb: "IMDB Rating: " + response.imdbRating,
                        tomatoes: "Rotten Tomatoes Rating: " + response.Ratings[1].Value,
                        language: "Language: " + response.Language,
                        plot: "Plot: " + response.Plot,
                        actors: "Actors: " + response.Actors + "\n"
                    };
                }
                else {
                    var resReturn = {
                        resource: "OMDB",
                        title: "Title: " + response.Title,
                        year: "Release Year: " + response.Year,
                        imdb: "IMDB Rating: " + response.imdbRating,
                        language: "Language: " + response.Language,
                        plot: "Plot: " + response.Plot,
                        actors: "Actors: " + response.Actors + "\n"
                    };
                }

                var values = Object.values(resReturn);

                appendDoc(values, 0);
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

function appendDoc(text, n) {

    if (n < text.length) {
        
        fs.appendFile("log.txt", (text[n]) + "\n", function(err) {

            if (err) {
                console.log("Error occurred: " + err);
            }
            else {
                appendDoc(text, (n + 1));
            }
        });
    }
    else {
        console.log("Content Added!\n");
    }
}