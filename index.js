var instance_skel = require('../../instance_skel');
var debug;
var log;

function instance(system, id, config) {
	var self = this;

	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions(); // export actions

	return self;
}

instance.prototype.updateConfig = function(config) {
	var self = this;

	self.config = config;
};
instance.prototype.init = function() {
	var self = this;

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
		'post': {
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
				self.log('info', 'HTTP POST Request failed');
				return;
			}

			self.log('info', 'HTTP POST Request OK');


		});
	}

	else if (action.action == 'get') {

		self.system.emit('rest_get', action.options.url, function (err, result) {

			if (err !== null) {
				self.log('info', 'HTTP GET Request failed');
				return;
			}

			self.log('info', 'HTTP GET Request OK');

		});
	}
};

instance.module_info = {
	label: 'HTTP',
	id: 'http',
	version: '1.2.0'
};

instance_skel.extendedBy(instance);
exports = module.exports = instance;