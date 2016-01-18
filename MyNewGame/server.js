var express = require( 'express' );
var app = express();
var http = require('http').Server(app);
var port = 8080;
var io = require('socket.io')(http);
var id = 1;
var user = {};
var users = {};

app.use(express.static("public"));

io.on('connection', function(socket){
	console.log('User ' + socket.id + ' connected');
	//Disconnects
	socket.on('disconnect', function(){
		console.log('user ' + socket.username + ' disconnected');
		users[socket.username]= {
			id: null
	};
});

//Moving
	socket.on('playerMove', playerMoved );
//Updata what i know about their postion
        socket.on('myPosition', function(newPos){
        	users[socket.username].x = newPos.x;
        	users[socket.username].y = newPos.y;

        });

//They pressed start So create a user
	socket.on('newPlayer', function(){
	//Create user
    	user = {
    		id: id,
    		x: 10,
    		y: 360
    	};

    //Place new user in users object
    	users[id] = user;

    //Current sockets username = user
		socket.username = id;
		console.log('Socket ' + user.id + ' has username of ' + socket.username );

	//Give the socket its new ID
		socket.emit('userName', user.id );

	//Populate with rest of the players
		socket.broadcast.emit('populate', users );
		socket.emit('populate', users );

	//Prepare for a new user
		id++;

	});

//Movement Right
	socket.on('playerMovedRight', function(user){
		//Tell everyone who moved
		socket.broadcast.emit('moveRight', user );
		//Tell yourself
		socket.emit('moveRight', user );
		console.log('User ' + socket.username + ' new position: x: ' + users[socket.username].x + ' y: ' + users[socket.username].y );
	});

//Movement Left
	socket.on('playerMovedLeft', function(user){
		//Tell everyone who moved
		socket.broadcast.emit('moveLeft', user );
		//Tell yourself
		socket.emit('moveLeft', user );
		console.log('User ' + socket.username + ' new position: x: ' + users[socket.username].x + ' y: ' + users[socket.username].y );
	});

//Stopped Right
	socket.on('playerStoppedRight', function(user){
		//Tell everyone who moved
		socket.broadcast.emit('stopRight', user );
		//Tell yourself
		socket.emit('stopRight', user );
	});

//Stopped Left
	socket.on('playerStoppedLeft', function(user){
		//Tell everyone who moved
		socket.broadcast.emit('stopLeft', user );
		//Tell yourself
		socket.emit('stopLeft', user );
	});

});

var server = http.listen(port, function(error){
	if(error) {
		console.log("Failed to start server: " + error);
	} else {
		console.log("Listening on port " + port);
	}
});

function playerMoved(xAxis)
{
	//console.log('Player' + this.id + ' moved to:' + xAxis);
}