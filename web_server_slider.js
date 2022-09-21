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
// app.get('/vote', function(request, response){
// 	response.sendFile(__dirname+'/client_vote_page.html');
// })
class Slider{
	constructor(){
		this.average_value = 0.5;
		this.dict = {}
	}
	update_dict(client_id,value){
		this.dict[client_id] = parseFloat(value) //the value is given to us as a string so we need to parse to float
	}
	remove_client(client_id){
		delete this.dict[client_id]
	}
	reset(){
		this.average_value = 0.5
	}
	average(){
		var sum = 0
		for (var client in this.dict){
			sum = sum + this.dict[client]
		}
		if (Object.keys(this.dict).length == 0){
			this.average_value = 0.5 //Get rid of bug where if there are no clients, there is no update to the faders so they don't "reset"
		}
		else {
			this.average_value = sum / Object.keys(this.dict).length
			this.average_value = this.average_value / 100 //normalize
		}
			
	}
	work(client_id,value){
		this.update_dict(client_id,value)
		this.average()
	}
}

// ------------ SOCKET Connection to Client socket.io ------------
var clients_connected = 0
var slider1 = new Slider()
var slider2 = new Slider()
var slider3 = new Slider()


//Messages from clients
io.on('connection', function(client) {

	//On Connect
	clients_connected++;
	console.log("Current Connections: ", clients_connected)
	// console.log(client.id)
	slider1.average()
	slider2.average()
	slider3.average()
	//On Disconnect
	client.on('disconnect', function(){
		slider1.remove_client(client.id)
		slider2.remove_client(client.id)
		slider3.remove_client(client.id)

		// slider1.average()
		// slider2.average()
		// slider3.average()
		
		clients_connected--;
		console.log('Current Connections: ', clients_connected)
	});




	//Max Client 
	client.on('max_client_connect',function(){
		console.log('Max client connected, sending current data')
		var average_values = {'slider1':slider1.average_value
					,'slider2':slider2.average_value
					,'slider3':slider3.average_value}
		io.emit('average_values',average_values) //Send current data (if any) on connection (sends on non_max client connect)
	})
	// Control Messages from Max Client
	client.on('reset',function(){
		console.log('max_reset')
		slider1.reset()
		slider2.reset()
		slider3.reset()
		io.emit('recieved_reset')
		// io.emit('color_vote',colorVoteObj.work())
	})




	//Messages from Clients
	client.on('slider1',function(value){
		console.log('Client:',client.id, 'Slider1:', value)
		slider1.work(client.id,value)
		var average_values = {'slider1':slider1.average_value
					,'slider2':slider2.average_value
					,'slider3':slider3.average_value}
		console.log(average_values)
		io.emit('average_values',average_values)
	})
	client.on('slider2',function(value){
		console.log('Client:',client.id, 'Slider1:', value)
		slider2.work(client.id,value)
		var average_values = {'slider1':slider1.average_value
					,'slider2':slider2.average_value
					,'slider3':slider3.average_value}
		console.log(average_values)
		io.emit('average_values',average_values)
	})
	client.on('slider3',function(value){
		console.log('Client:',client.id, 'Slider1:', value)
		slider3.work(client.id,value)
		var average_values = {'slider1':slider1.average_value
					,'slider2':slider2.average_value
					,'slider3':slider3.average_value}
		console.log(average_values)
		io.emit('average_values',average_values)
	})

});





