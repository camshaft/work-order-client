/**
 * Module dependencies
 */

var request = require('request');
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
  request(self.root, function(status, response, data) {
    self.state = JSON.parse(data)
    cb(null, self);
  });
};

Queue.prototype.get = function(index, cb) {
  var self = this;
  var item = self.state.collection.items[index];
  request(resolve(this.root, item.href), function(error, response, data) {
    cb(null, new Job(self.root, item.href, JSON.parse(data)));
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
    var opts = {
      url: resolve(this.root, this.state.start),
      method: "POST" }
    request(opts, cb)
  } else {
    //console.log("Start Skipped")
    cb();
  }
}

Job.prototype.status = function(data, cb) {
  if (this.state.status) {
    var opts = {
      url: url.parse(this.root),
      path: resolve(this.root, this.state.status) }
    if (data) {
      opts.json = data;
      opts.method = "PUT";
      request(opts, cb);
    } else {
      request(opts, cb);
    }
  } else {
    //console.log("Status Skipped")
    cb();
  }
};

Job.prototype.complete = function(data, cb) {
  if (this.state.complete) {
    var opts = {
      url: url.parse(this.root),
      path: resolve(this.root, this.state.complete),
      body: data,
      method: "POST" }
    request(opts, cb);
  } else {
    //console.log("Complete Skipped")
    cb();
  }
};

Job.prototype.fail = function(data, cb) {
  if (this.state.fail) {
    var opts = {
      url: url.parse(this.root),
      path: resolve(this.root, this.state.fail),
      json: data,
      method: "POST" }
    request(opts, cb);
  } else {
    //console.log("Fail Skipped")
    cb();
  }
};
