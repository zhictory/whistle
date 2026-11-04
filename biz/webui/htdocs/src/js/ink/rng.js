/*
 * Seeded random source for the hand-drawn outlines, ported from the ink engine
 * of Looseleaf (MIT, kevintngo/looseleaf). Values are deterministic per seed so
 * a control keeps the same wobble between renders.
 */

var AVALANCHE = 0x9e3779b9;

function avalanche(h) {
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

function hashSeed(key) {
  key = String(key);
  var h = 0x811c9dc5;
  for (var i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return avalanche(h) || AVALANCHE;
}

function clamp(value, min, max) {
  return value < min ? min : value > max ? max : value;
}

function create(seed) {
  var state = (seed >>> 0) || AVALANCHE;

  function rand() {
    state = (state + 0x6d2b79f5) >>> 0;
    var t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  rand.seed = state;
  rand.range = function (min, max) {
    return min + rand() * (max - min);
  };
  rand.int = function (min, max) {
    return Math.floor(rand.range(min, max + 1));
  };
  rand.chance = function (p) {
    return rand() < p;
  };
  rand.sign = function () {
    return rand() < 0.5 ? -1 : 1;
  };
  rand.pick = function (list) {
    return list[Math.floor(rand() * list.length)];
  };
  rand.gauss = function (mean, sd) {
    mean = mean || 0;
    sd = sd == null ? 1 : sd;
    var u = 1 - rand();
    var v = rand();
    return mean + sd * Math.sqrt(-2 * Math.log(u || 1e-6)) * Math.cos(2 * Math.PI * v);
  };
  rand.fork = function (name) {
    return create(hashSeed(String(name) + ':' + seed));
  };
  return rand;
}

exports.hashSeed = hashSeed;
exports.clamp = clamp;
exports.create = create;
