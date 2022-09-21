var io =  require('socket.io-client');

var socket = io.connect('http://localhost:8080',{reconnect: true});

socket.on('connect', function(){console.log('Connected')})
socket.on('disconnect',function(){console.log('Disconnected, trying auto-reconnect')})


// socket.on('red_server',function(){console.log('red_server')})
// socket.on('green_server',function(){console.log('green_server')})
// socket.on('blue_server',function(){console.log('blue_server')})

socket.on('color_vote',function(data){
	console.log(data)
})