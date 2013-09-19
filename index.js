/**
 * Module dependencies
 */

var superagent = require('superagent');
var resolve = require('url').resolve;

module.exports = Server;

function Server(root) {
  if (!(this instanceof Server)) return new Server(root);
  this.root = root;
};

Server.prototype.orders = function(cb) {
  var root = this.root;

  var queue = new Queue(root);
  queue.refresh(cb);
};

function Queue(root) {
  this.root = root;
};

Queue.prototype.refresh = function(cb) {
  var self = this;
  superagent
    .get(root)
    .on('error', cb)
    .end(function(res) {
      if (res.error) return cb(res.error);

      self.state = res.body;
      cb(null, self);
    });
};

Queue.prototype.checkout = function(index, cb) {
  var self = this;
  var item = self.state.collection.items[index];

  superagent
    .get(resolve(self.root, item.href))
    .on('error', cb)
    .end(function(res) {
      if (res.error) return cb(res.error);

      // TODO do we need to check the status?

      superagent
        .post(resolve(self.root, res.body.start))
        .on('error', cb)
        .end(function(res) {
          if (res.error) return cb(res.error);

          cb(null, new Job(self.root, res.body));
        });
    });
};

function Job(root, state) {
  this.state = state;
  this.root = root;
};

Job.prototype.isType = function(type) {
  return type === this.state.type;
};

Job.prototype.status = function(cb) {
  superagent
    .post(resolve(this.root, this.state.status))
    .on('error', cb)
    .end(function(res) {
      if (res.error) return cb(res.error);
      cb(null, res.body);
    });
};

Job.prototype.complete = function(data, cb) {
  superagent
    .post(resolve(this.root, this.state.complete))
    .send(data)
    .on('error', cb)
    .end(function(res) {
      if (res.error) return cb(res.error);
      cb();
    });
};

Job.prototype.fail = function(cb) {
  superagent
    .post(resolve(this.root, this.state.fail))
    .on('error', cb)
    .end(function(res) {
      if (res.error) return cb(res.error);
      cb();
    });
};
