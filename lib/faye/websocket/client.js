var util = require('util'),
  net = require('net'),
  tls = require('tls'),
  driver = require('websocket-driver'),
  API = require('./api'),
  Event = require('./api/event');

var Client = function(url, protocols, options) {
  options = options || {};

  this.url = url;
  this._uri = require('url').parse(url);
  this._driver = driver.client(url, {
    maxLength: options.maxLength,
    protocols: protocols
  });

  ['open', 'error'].forEach(function(event) {
    this._driver.on(event, function() {
      self.headers = self._driver.headers;
      self.statusCode = self._driver.statusCode;
    });
  }, this);

  var secure = (this._uri.protocol === 'wss:'),
    onConnect = function() {
      self._driver.start();
    },
    tlsOptions = {},
    self = this;

  if (options.ca) tlsOptions.ca = options.ca;
  if (GlobalSocket) tlsOptions.socket = GlobalSocket;
  if (options.socket) tlsOptions.socket = options.socket;

  if (SocketFactory) {
    SocketFactory(this._uri.port || 443, this._uri.hostname, function(socket) {
      tlsOptions.socket = socket;
      connect();
    });
  } else {
    connect();
  }

  var self = this;

  function connect() {
    var connection = secure ? tls.connect(self._uri.port || 443, self._uri.hostname, tlsOptions, onConnect) : net.createConnection(self._uri.port || 80, self._uri.hostname);

    self._stream = connection;
    if (!secure) self._stream.on('connect', onConnect);

    API.call(self, options);
  }


};
util.inherits(Client, API);

module.exports = Client;