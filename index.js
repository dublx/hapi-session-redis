var Hapi = require('hapi');
var Yar = require('yar');

# instantiate server and configure cache using Redis
var server = new Hapi.Server({
	cache: {
		name: 'redis',
		engine: require('catbox-redis'),
		options:{
			partition: 'partition',
			segment: 'segment',
			shared: true
		}
	}
});

# configure port from env var or default 
server.connection({
	port: process.env.PORT || 8080
});

# register Yar session plugin
var options = {
	cache: {cache:'redis'},
	maxCookieSize: 0,
	cookieOptions: {
		password: 'password', // Required
		isSecure: false // Required if using http
	}
};
server.register({
	register: Yar,
	options: options
}, function(err) {
	if (err) {
		console.log(err);
		throw err;
	}
});

# main route - returns session store
server.route({
	method: 'GET',
	path: '/',
	config: {
		handler: function(request, reply) {
			console.log('/');
			return reply(request.session._store);
		}
	}
});

# set a key/value in session
server.route({
	method: 'GET',
	path: '/set/{key}/{value}',
	config: {
		handler: function(request, reply) {
			console.log('/set/%s/%s', request.params.key, request.params.value);
			request.session.set(request.params.key, request.params.value);
			return reply();
		}
	}
});

# get a key/value from session
server.route({
	method: 'GET',
	path: '/get/{key}',
	config: {
		handler: function(request, reply) {
			console.log('/get/%s', request.params.key);
			var keyValue = request.session.get(request.params.key);
			return reply(keyValue);
		}
	}
});

# clear the session from the store
server.route({
	method: 'GET',
	path: '/clear',
	config: {
		handler: function(request, reply) {

			request.session.reset();
			return reply.redirect('/');
		}
	}
});

# init server
server.start(function() {
	console.log('server started on port: ', server.info.port);
});
