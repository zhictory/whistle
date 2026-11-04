/*
 * Turns a control's box into pencil paths. Results are cached per seed and
 * size because a toolbar can hold a hundred buttons that never change size.
 */

var rng = require('./rng');
var shapes = require('./shapes');
var geom = require('./geom');

var cache = {};
var CACHE_LIMIT = 800;
var cacheSize = 0;
var PAD = 0.7;

function build(key, width, height) {
  var id = key + ':' + width + 'x' + height;
  var hit = cache[id];
  if (hit) {
    return hit;
  }
  var random = rng.create(rng.hashSeed(key));
  var w = Math.max(4, width - PAD * 2);
  var h = Math.max(4, height - PAD * 2);
  var points = shapes.boxPoints(random, w, h, { loose: 1.5 });
  var out = { d: geom.toPath(offset(points, PAD, PAD)) };
  if (cacheSize > CACHE_LIMIT) {
    cache = {};
    cacheSize = 0;
  }
  cache[id] = out;
  cacheSize++;
  return out;
}

function underline(key, width, height) {
  var id = 'u:' + key + ':' + width + 'x' + height;
  var hit = cache[id];
  if (hit) {
    return hit;
  }
  var random = rng.create(rng.hashSeed('u:' + key));
  var points = shapes.underlinePoints(random, Math.max(4, width - PAD * 2), height);
  var out = { d: geom.toPath(offset(points, PAD, 0)) };
  cache[id] = out;
  return out;
}

function offset(points, dx, dy) {
  var out = new Array(points.length);
  for (var i = 0; i < points.length; i++) {
    out[i] = [points[i][0] + dx, points[i][1] + dy];
  }
  return out;
}

exports.build = build;
exports.underline = underline;
