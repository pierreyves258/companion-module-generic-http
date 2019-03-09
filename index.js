var instance_skel = require('../../instance_skel');
var debug;
var log;

function instance(system, id, config) {
	var self = this;

	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions(); // export actions
	self.init_feedbacks();
	return self;
}

instance.prototype.updateConfig = function(config) {
	var self = this;

	self.config = config;
};
instance.prototype.init = function() {
	var self = this;

	self.lastresponse = ''
	self.system.on('HttpResponse', (data) => {
		self.lastresponse = data
		self.checkFeedbacks('http_response')
	})

	self.status(self.STATE_OK);

	debug = self.debug;
	log = self.log;
};

// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this;
	return [
		{
			type: 'text',
			id: 'info',
			width: 12,
			label: 'Information',
			value: '<strong>PLEASE READ THIS!</strong> Generic modules is only for use with custom applications. If you use this module to control a device or software on the market that more than you are using, <strong>PLEASE let us know</strong> about this software, so we can make a proper module for it. If we already support this and you use this to trigger a feature our module doesnt support, please let us know. We want companion to be as easy as possible to use for anyone.'
		},
	]
};

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;
	debug("destroy");
};

instance.prototype.actions = function(system) {
	var self = this;
	self.system.emit('instance_actions', self.id, {
		'post': {
			label: 'POST',
			options: [
				{
					 type: 'textinput',
					 label: 'URL',
					 id: 'url',
					 default: '',
				}
			]
		},
		'get': {
			label: 'GET',
			options: [
				{
					 type: 'textinput',
					 label: 'URL',
					 id: 'url',
					 default: '',
				}
			]
		}
	});
}

instance.prototype.action = function(action) {
	var self = this;
	var cmd;

	if (action.action == 'post') {

		self.system.emit('rest', action.options.url, {}, function (err, result) {

			if (err !== null) {
				self.log('error', 'HTTP POST Request failed');
				return;
			}
			self.system.emit('HttpResponse', result.data.toString('utf8'))
			self.log('info', 'HTTP POST Request OK');

		});
	}

	else if (action.action == 'get') {

		self.system.emit('rest_get', action.options.url, function (err, result) {

			if (err !== null) {
				self.log('error', 'HTTP GET Request failed');
				console.log('ERR', err)
				return;
			}
			console.log('RES', result.data.toString('utf8'))
			self.system.emit('HttpResponse', result.data.toString('utf8'))
			self.log('info', 'HTTP GET Request OK');

		});
	}
};

instance.prototype.init_feedbacks = function() {
	var self = this;

	// feedbacks
	var feedbacks = {};

	feedbacks['http_response'] = {
		label: 'HTTP response match',
		description: 'If the http response match text change background color',
		options: [
			{
				type: 'colorpicker',
				label: 'Foreground color',
				id: 'fg',
				default: self.rgb(255,255,255)
			},
			{
				type: 'colorpicker',
				label: 'Background color',
				id: 'bg',
				default: self.rgb(255,0,0)
			},
			{
				type: 'textinput',
				label: 'response',
				id: 'response',
				default: '',
		   }
		]
	};

	self.setFeedbackDefinitions(feedbacks);
};

instance.prototype.feedback = function(feedback, bank) {
	var self = this;

	if (feedback.type == 'http_response') {
		if (self.lastresponse == feedback.options.response) {
			return { color: feedback.options.fg, bgcolor: feedback.options.bg };
		}
	}

	return {};
};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
