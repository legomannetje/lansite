//
//  Lansite TextBox
//  By Tanner Krewson
//

var Box = require('./require');


TextBox.prototype = Object.create(Box.prototype);

function TextBox(data) {
    Box.call(this);
    this.id = TextBox.id;
    
    this.text = data;
}

TextBox.id = "TextBox";

TextBox.prototype.changeText = function(text) {
    this.text = text;
}
TextBox.prototype.addResponseListeners = function(socket, dispatcher) {
	//not much to do here... yet
}


module.exports = TextBox;
