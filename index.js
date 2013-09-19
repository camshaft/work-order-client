/**
 * Module dependencies
 */

var superagent = require('superagent');
var getJSON = require('./getJson').getJSON;
var postJSON = require('./getJson').postJSON;
var url = require('url');
var resolve = require('url').resolve;

module.exports = Server;

function Server(root) {
  if (!(this instanceof Server)) return new Server(root);
  this.root = root;
  this.queue = new Queue(root);
};

function Queue(root) {
  this.root = root;
  this.state = null;
};

Queue.prototype.refresh = function(cb) {
  var self = this;  
  getJSON(url.parse(self.root), function(status, data) {
    self.state = data
    cb(null, self);
  });
};

Queue.prototype.get = function(index, cb) {
  var self = this;
  var item = self.state.collection.items[index];
  var opts = url.parse(self.root);
  opts.path = item.href;
  getJSON(opts, function(status, data) {
    cb(null, new Job(self.root, item.href, data));
  });
}

function Job(root, path, state) {
  this.state = state;
  this.root = root;
  this.path = path;
};

Job.prototype.isType = function(type) {
  return type === this.state.type;
};

Job.prototype.start = function(data, cb) {
  if (this.state.start) {
    var opts = url.parse(this.root);
    opts.path = resolve(this.root, this.state.start);
    postJSON(opts, data, cb);
  }
}

Job.prototype.status = function(data, cb) {
  if (this.state.status) {
    var opts = url.parse(this.root);
    opts.path = resolve(this.root, this.state.status);
    if (data) {
      postJSON(opts, data, cb)
    } else {
      getJSON(opts, cb);
    }
  }
};

Job.prototype.complete = function(data, cb) {
  if (this.state.complete) {
    var opts = url.parse(this.root);
    opts.path = resolve(this.root, this.state.complete);
    postJSON(opts, data, cb);
  }
};

Job.prototype.fail = function(data, cb) {
  if (this.state.fail) {
    var opts = url.parse(this.root);
    opts.path = resolve(this.root, this.state.fail);
    postJSON(opts, data, cb);
  }
};
