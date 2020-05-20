      (function() {

        /**
         * Obtains parameters from the hash of the URL
         * @return Object
         */
        function getHashParams() {
          var hashParams = {};
          var e, r = /([^&;=]+)=?([^&;]*)/g,
              q = window.location.hash.substring(1);
          while ( e = r.exec(q)) {
             hashParams[e[1]] = decodeURIComponent(e[2]);
          }
          return hashParams;
        }
        //Yet again more new stuff 
        var userSongsSource = document.getElementById('user-songs-template').innerHTML,
            userSongsTemplate = Handlebars.compile(userSongsSource),
            userSongsPlaceholder = document.getElementById('user-songs');  

        var params = getHashParams();

        var access_token = params.access_token,
            refresh_token = params.refresh_token,
            error = params.error,
            result = params.result;
 
        if (error) {
          alert('There was an error during the authentication');
            
        } else {
          if (access_token) {
            $('#login').hide();
            $('#loggedin').show();

              console.log("here");
                userSongsPlaceholder.innerHTML = userSongsTemplate({
                   answer: result   
                  });
          } else {
              // render initial screen
              $('#login').show();
              $('#loggedin').hide();
          }
        }
      })();