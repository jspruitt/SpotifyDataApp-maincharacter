/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

var client_id = '3cbc3d610d1a4417b7724c89d07b3108'; // Your client id
var client_secret = 'f02ff1d135654391918df381edcb51f9'; // Your secret
var redirect_uri = "https://obscure-ravine-59754.herokuapp.com/callback/"; // Your redirect uri 

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());


app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email user-read-recently-played user-top-read';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me/top/tracks',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };
        // Also Money
        // use the access token to access the Spotify Web API
        var total_danceability = 0.0;
        request.get(options, function(error, response, body) {
          var id;
          console.log("Length: " + body['items'].length)
          var danceability = [];
          for(var i = 0; i < body['items'].length; i++)
            {
             
               id = body['items'][i]['id']   
                var options_two = {
                    url: 'https://api.spotify.com/v1/audio-features/' + id,
                    headers: { 'Authorization': 'Bearer ' + access_token },
                    json: true
                };
                request.get(options_two, function(error_two, response_two, body_two){
                    danceability.push(total_danceability);
                    total_danceability = total_danceability + body_two['danceability']/ body['items'].length;
                    if(danceability.length == body['items'].length)
                    {
                        var answer = "";
                        if (total_danceability > 0.5)
                            answer = "YES";
                        else
                            answer = "NO"
                        console.log("DONE");
                        res.redirect('/#' +
                            querystring.stringify({
                                access_token: access_token,
                                refresh_token: refresh_token,
                                result: answer
                        }));
                        console.log(total_danceability);
                    }
                });

            }
            
        });
        //we can also pass the token to the browser to make requests from there
      }  
        else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      } 
    });
  }
});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});
app.get('/', function(req, res){
    res.redirect("'/public/index.html'")
});
app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});