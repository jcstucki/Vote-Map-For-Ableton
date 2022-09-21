// Copyright Jacob C. Stucki III
 'use strict';
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server); //server mounts on node.js http server

//Listen to port on IP
server.listen(8080, function(){
	console.log('Listening on *:8080');
})


//-----Serve Homepage to client 
app.get('/', function(request, response){
	response.sendFile(__dirname+'/client_vote_page.html');
	// response.sendFile(__dirname+'/landing_page.html');
})
class Slider{
	constructor(){
		this.average_value = 50;
		this.dict = {}
	}
	update_dict(client_id,value){
		this.dict[client_id] = value
	}
	remove_client(client_id){
		delete this.dict[client_id]
	}
	reset(){
		this.average_value = 50
	}
	average(){
		var sum = 0
		for (var client in this.dict){
			sum = sum + this.dict[client]
		}
		this.average_value = sum / this.dict.keys.length
	}
}

// Classes
class Color_Vote{
	constructor(){
		this.red_count = 0;
		this.blue_count = 0;
		this.green_count = 0;

		this.red_pct = 0;
		this.blue_pct = 0;
		this.green_pct = 0;

		this.client_vote_dict = {}
		this.number_of_clients_connected = 0
	};

	update_client_vote_dict(client_id,vote){ //also works as add_to_
		this.client_vote_dict[client_id] = vote
	};

	remove_from_client_vote_dict(client_id){
		var vote = this.client_vote_dict[client_id]
		if (vote == 'red'){
				this.red_count--
			} else if (vote == 'green') {
				this.green_count--
			} else if (vote == 'blue'){
				this.blue_count--
			}
		delete this.client_vote_dict[client_id]
	};

	work(){
		//count up votes in dictionary
		this.reset() // because don't want to add constantly to votes

		for (var client_id in this.client_vote_dict){
			var vote = this.client_vote_dict[client_id]

			if (vote == 'red'){
				this.red_count++
			} else if (vote == 'green') {
				this.green_count++
			} else if (vote == 'blue'){
				this.blue_count++
			}
		}

		//sum votes and calculate percentage (of votes, not percentage of connected clients)
		var total = this.red_count + this.blue_count + this.green_count
		if (total > 0){ //Otherwise it's NaN when we reset
			this.red_pct = this.red_count / total
			this.blue_pct = this.blue_count / total
			this.green_pct = this.green_count / total
		};

		//create and return dictionary
		var dict = {'red':this.red_pct
							,'blue':this.blue_pct
							,'green':this.green_pct}
		return dict
	};
	reset(){
		this.red_count = 0
		this.blue_count = 0
		this.green_count = 0
		this.red_pct = 0
		this.blue_pct = 0
		this.green_pct = 0
	};
};

// ------------ SOCKET Connection to Client socket.io ------------
var colorVoteObj = new Color_Vote();

//Messages from clients
io.on('connection', function(client) {

	//On Connect
	colorVoteObj.number_of_clients_connected++;
	console.log("Current Connections: ", colorVoteObj.number_of_clients_connected)
	// console.log(client.id)

	//On Disconnect
	client.on('disconnect', function(){
		colorVoteObj.number_of_clients_connected--;
		colorVoteObj.remove_from_client_vote_dict(client.id)
		console.log('Current Connections: ', colorVoteObj.number_of_clients_connected)
	});




	//Max Client 
	client.on('max_client_connect',function(){
		console.log('Max client connected, sending current data')
		io.emit('color_vote',colorVoteObj.work()) //Send current data (if any) on connection (sends on non_max client connect)
	})
	//Control Messages from Max Client
	client.on('max_reset_cv',function(){
		console.log('max_reset_cv')
		colorVoteObj.reset()
		io.emit('recieved_reset_cv')
		io.emit('color_vote',colorVoteObj.work())
	})




	//Messages from Clients
	client.on('vote',function(vote){
		console.log('Client: ', vote)
		colorVoteObj.update_client_vote_dict(client.id, vote)
		io.emit('color_vote',colorVoteObj.work())
	})

});





