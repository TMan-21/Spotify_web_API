const SpotifyWebApi = require('spotify-web-api-node');//This line imports the spotify-web-api-node module, 
//which provides functionalities for interacting with the Spotify Web API in a Node.js environment.

//Spotify variable declaration
let client_id = '238344e2f02e4abaa4e65e6bf82e8794';/*A client ID is a unique identifier assigned to a client application, 
when it registers with a service provider (such as Spotify). 
It is used for authentication and authorization*/
let client_secret = '88d95829f30542bf978dbc7ba74137b6';
let redirect_uri = 'http://localhost/callback';

// credentials are optional
/*This line creates a new instance of the SpotifyWebApi object, which is used to interact with the Spotify Web API. 
It initializes the object with configuration options such as the client ID, client secret, and redirect URI.*/
var spotifyApi = new SpotifyWebApi({ 
  clientId: client_id,
  clientSecret: client_secret,
  redirectUri: redirect_uri
});
const fs = require('fs'); //Declare the file system



//1.menu
function Menu(){
    console.log(
        '1. Search for a song on Spotify\n2. Perform adhoc\n3.Exit'
    );
    const prompt = require("prompt-sync")({ sigint: true });//This line imports the prompt-sync module, allowing you to prompt the user for input in a synchronous manner in Node.js
    const option = prompt("Select and option: ");
    switch (option) { //perform function according to users input
       
        case "1":         
            const ask = require("prompt-sync")({ sigint: true });
            let songName = ask("Enter a song name: "); //Get song name
            spotifySongs(songName);
            break;
        case "2":
            let searchText = Readtextfile(); // return data from random textfile
            if (searchText) { // if searchText is defined and not null after reading data from random textfile
                adhocfunction(searchText); //data from random textfile is passed to adhoc function that return either a print string or list or songs with the searched name in random text
                console.log("Adhoc function has been performed that searches for 10 most popular songs with Name in the random textfile!!");
            } else {
                console.log("Error: Could not read the file or file is empty.");
            }
            break;
        case "3":
            process.exit(); //stop program execution

        default:
            console.log('Please select a valid option next time');
            break;
    }
    
}

function spotifySongs(songName) {
    spotifyApi.clientCredentialsGrant().then(
        function(data) {
            console.log('The access token is ' + data.body['access_token']);
            spotifyApi.setAccessToken(data.body['access_token']);//This line sets the access token received from the Spotify API response in
            //the Spotify API client for further authenticated requests.


            spotifyApi.searchTracks(songName) //This passes the song name as an argument and allows spotify to search for the song
                .then((data) => {
                    const tracks = data.body.tracks.items;//takes the search results received from Spotify and extracts the list of tracks found

                    if (tracks.length > 0) { //if the song is duration is greater than 0 
                        // Sorting tracks based on popularity
                        tracks.sort((a, b) => b.popularity - a.popularity); // compares popularity off songs and sorts them in descending order in the array tracks to allow us to display 
                        //only the top 10 
                        
                        console.log("\nTen most popular song with the name you have entered:\n")

                        //This will display info on the top 10 tracks in descending order
                        for (let i = 0; i < Math.min(10, tracks.length); i++) {
                            const track = tracks[i];
                            const artists = track.artists.map(artist => artist.name).join(', ');
                            const song = track.name;
                            const previewLink = track.preview_url;
                            const album = track.album.name;

                            console.log(`Track ${i + 1}:`);
                            console.log('Artist(s): ' + artists);
                            console.log('Song: ' + song);
                            console.log('Preview Link: ' + previewLink);
                            console.log('Album: ' + album);
                            console.log('\n');
                        }
                    } else {
                        console.log('No tracks found for the given song name.'); // logs if there are no search results for the song name 
                    }
                })
                .catch((err) => {
                    console.error('Error occurred while searching for tracks:', err); // runs if theres an error searching for tracks
                });
        })
        .catch((err) => {
            console.error('Error occurred while getting access token:', err);//error displays if achieving access token fails
        });
}


// Function to read the content of random.txt file
function Readtextfile() {
    try {
        const data = fs.readFileSync('random.txt', 'utf8');
        if (data.trim().length === 0) {
            throw new Error("File is empty");
        }
        return data;
    } catch (err) {
        console.error('Error reading the file:', err);
        return null;
    }
}

// Function to handle ad-hoc commands
function adhocfunction(searchText) {//ad-hoc function is a special-purpose function created to handle specific tasks or commands
    console.log(`\nFile content:\n${searchText}`);  // Log/Display the file content

    const lines = searchText.split('\n');//splits a string of text into an array of lines, with each line as an element in the array, based on the newline character (\n).
    lines.forEach(line => {
        if (line.trim().length === 0) return; // Skip empty lines
        const [command, ...args] = line.split(':');
        /*This line splits a line of text into two parts the command and its arguments, based on the colon (:) separator. 
        The command is stored in the variable command, and any other arguments are stored in the array args. */
        if (!command || args.length === 0) { //if command is empty or if arguments are empty then invalid format 
            console.error(`Invalid format in line: ${line}`);
            return;
        }
        const query = args.join(':').trim();//This line combines the arguments extracted from the line back into a single string,
        // separated using a colon. also removes white spaces between words 


        switch (command.trim().toLowerCase()) {//removes whitespace from commands 
            case 'search': // if command is "search" then search argument is passed through spotifySongs function
                spotifySongs(query);
                break;
            case 'print':
                console.log(query);// if command is "print" a string is logged from the random text file
                break;
            default:
                console.log(`Unknown command: ${command}`); //if command is not search or print then command is unknown
                break;
        }
    });
}

// Run the menu function to start the application
Menu();
