//
//  Lansite Client Connect4Box
//  By Tanner Krewson
//

BoxNames.push('Connect4Box');

Connect4Box.prototype = Object.create(Box.prototype);

function Connect4Box(data) {
    Box.call(this, data.id, data.unique);
    this.updateData(data);
}

//@Override
Connect4Box.prototype.updateData = function(data) {
    //Add your constructor here
    this.matches = data.matches;
    this.url = data.url;
}


//@Override
Connect4Box.prototype.show = function() {

    //Runs the parent show function
    Box.prototype.show.call(this);

    //Access to this box on the page
    var thisConnect4Box = $('#' + this.unique);

    //add an event to the submit button of the popup
    var self = this;
    var userId = Cookies.get('id');

    var button = thisConnect4Box.find('.matchadd');

    //prevent multiple click events from being binded
    button.off('click');

    button.on('click', function(event) {

        //generate c4 game id (must be 40 characters)
        var c4id;
        do {
          c4id = (Math.random()*1e64).toString(36);
          //need to make sure it will be 40 characters, b/c it might not be
        } while (c4id.length !== 40);

        SendToServer.eventFromIndBox(self.unique, 'newmatch', {
          c4id: c4id
        });

        //open connect 4 as host
        var url = self.url + '?createid=' + c4id;
        var win = window.open(url, '_blank');
        win.focus();
    });
}

//@Override
Connect4Box.prototype.update = function() {
    this.drawMatches();

    for (var i = this.matches.length - 1; i >= 0; i--) {
        this.updateMatchString(this.matches[i]);
    };
}

Connect4Box.prototype.drawMatches = function() {
    //clear current matches from page
    $('#' + this.unique).find('.matches').empty();

    var self = this;
    var thisConnect4Box = $('#' + this.unique);
    var userId = parseInt(Cookies.get('id'));

    //If there are no matches
    if (this.matches.length === 0){
        //show the empty list text
        thisConnect4Box.find('.Connect4Boxempty').show();
    } else {
        //hide the text
        thisConnect4Box.find('.Connect4Boxempty').hide();
    }

    for (var i = 0; i < this.matches.length; i++) {
        var matchTemplate = Box.findTemplate('Connect4Box-match');
        var thisMatchElement = thisConnect4Box.find('.matches').append(matchTemplate).children(':last');

        var thisMatch = this.matches[i];
        var matchC4id = thisMatch.c4id;
        var matchUnique = thisMatch.unique;

        //add an id to our choice
        thisMatchElement.attr('id', matchUnique);

        //update the text for this match
        this.updateMatchString(thisMatch);

        var acceptButton = thisMatchElement.find('.matchaccept');
        var cancelButton = thisMatchElement.find('.matchcancel');

        //precautionary
        acceptButton.hide();
        cancelButton.hide();

        //determine which button to show
        // if this user is in the match
        if (this.isUserHost(userId, thisMatch)) {
            //display the cancel button, hide the accept button
            acceptButton.hide();
            cancelButton.show();

            (function(mu) {
                cancelButton.click(function(){
                    SendToServer.eventFromIndBox(self.unique, 'cancel', {
                        'matchUnique': mu
                    });
                });
            })(matchUnique);
        } else {
            acceptButton.show();
            cancelButton.hide();

            (function(mu) {
                acceptButton.click(function(){
                    SendToServer.eventFromIndBox(self.unique, 'accept', {
                        'matchUnique': mu
                    });

                    var usernameArg = '';

                    //hacky way of getting the username of ourselves
                    for (var i = 0; i < mainSidebar.users.length; i++) {
                      //if our user id is equal to the one in the list
                      if (userId === mainSidebar.users[i].id) {
                        //get the username from that user
                        usernameArg = '&name=' + mainSidebar.users[i].username;
                        break;
                      }
                    }

                    //join the connect 4 match
                    var url = self.url + '?joinid=' + matchC4id + usernameArg;
                    var win = window.open(url, '_blank');
                    win.focus();
                });
            })(matchUnique);
        }
    };
}

Connect4Box.prototype.updateMatchString = function(match) {
    var result = match.host.username + ' is looking for an opponent';
    $('#' + match.unique).children('.matchstring').html(result);
}

Connect4Box.prototype.isUserHost = function(userId, match) {
    if (match.host.id === userId) {
        return true;
    }
    return false;
}

/*
	You may send information to the server using the SendToServer
    object, like so:

	SendToServer.eventFromIndBox(boxUnique, eventName, data);
	SendToServer.request(requestName, data);
*/
