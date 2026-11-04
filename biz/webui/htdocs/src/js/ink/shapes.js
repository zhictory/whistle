/*
 * Sketchy shapes, ported from Looseleaf's ink engine (MIT). `chain` rounds the
 * corners with a hand tremor, `boxPoints` walks the four sides of a control so
 * the outline starts somewhere in the middle of the top edge and closes with a
 * small over-run, exactly like a pencil following a ruler.
 */

var geom = require('./geom');
var clamp = require('./rng').clamp;

var seg = geom.seg;

function dirv(a, b) {
  var len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  return [(b[0] - a[0]) / len, (b[1] - a[1]) / len];
}

function chain(vertices, bows, rad, rng, count) {
  count = count || 14;
  var edges = vertices.length - 1;
  var dirs = [];
  var lens = [];
  var i;
  var j;
  for (i = 0; i < edges; i++) {
    dirs.push(dirv(vertices[i], vertices[i + 1]));
    lens.push(Math.hypot(vertices[i + 1][0] - vertices[i][0], vertices[i + 1][1] - vertices[i][1]));
  }
  var radii = new Array(edges + 1);
  for (i = 0; i <= edges; i++) {
    radii[i] = 0;
  }
  for (j = 1; j < edges; j++) {
    var r = Math.min(rad * (0.75 + rng() * 0.5), lens[j - 1] * 0.45, lens[j] * 0.45);
    radii[j] = r < 0.6 ? 0 : r;
  }
  var out = [];
  for (i = 0; i < edges; i++) {
    var start = [
      vertices[i][0] + dirs[i][0] * radii[i],
      vertices[i][1] + dirs[i][1] * radii[i]
    ];
    var end = [
      vertices[i + 1][0] - dirs[i][0] * radii[i + 1],
      vertices[i + 1][1] - dirs[i][1] * radii[i + 1]
    ];
    var pts = seg(start[0], start[1], end[0], end[1], bows[i] || 0,
      Math.max(2, Math.ceil(Math.hypot(end[0] - start[0], end[1] - start[1]) / count)));
    if (i > 0 && radii[i] === 0) {
      pts.shift();
    }
    for (j = 0; j < pts.length; j++) {
      out.push(pts[j]);
    }
    if (i < edges - 1 && radii[i + 1] > 0) {
      var vertex = vertices[i + 1];
      var radius = radii[i + 1];
      var a = end;
      var b = [vertex[0] + dirs[i + 1][0] * radius, vertex[1] + dirs[i + 1][1] * radius];
      var k = 0.9 + rng() * 0.1;
      var c = [
        vertex[0] * k + ((a[0] + b[0]) / 2) * (1 - k),
        vertex[1] * k + ((a[1] + b[1]) / 2) * (1 - k)
      ];
      for (j = 1; j < 4; j++) {
        var t = j / 4;
        var u = 1 - t;
        out.push([
          u * u * a[0] + 2 * u * t * c[0] + t * t * b[0],
          u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]
        ]);
      }
    }
  }
  return out;
}

/* One closed-ish pencil outline for a w by h box, drawn at (0, 0). */
function boxPoints(rng, w, h, opts) {
  opts = opts || {};
  var loose = opts.loose || 1;
  var min = Math.min(w, h);
  var jitter = clamp(0.012 * min, 0.12, 0.4) * loose;
  var tilt = rng.gauss(0, 0.0012) * loose;
  var rad = opts.corner || clamp(min * 0.09, 0.9, 3.4);
  function corner(px, py, sign) {
    return [px + rng.gauss(0, jitter), py + rng.gauss(0, jitter) + sign * tilt * w];
  }
  var tl = corner(0, 0, 0);
  var tr = corner(w, 0, 1);
  var br = corner(w, h, 1);
  var bl = corner(0, h, 0);
  function lift(len) {
    return rng.range(0.05, 0.32) * clamp(len / 110, 0.3, 1.2) * loose;
  }
  function drift(len) {
    return rng.gauss(0, 0.1) * clamp(len / 40, 0.4, 1) * loose;
  }
  var t0 = rng.range(0.35, 0.65);
  var start = [tl[0] + (tr[0] - tl[0]) * t0, tl[1] + (tr[1] - tl[1]) * t0];
  var overrun = Math.min(0.06 * w, rng.range(1.6, 2.6));
  var vertices = [start, tr, br, bl, tl, [start[0] + overrun, start[1]]];
  var bows = [-lift(w * (1 - t0)), drift(h), lift(w), drift(h), -lift(w * t0 + overrun)];
  return chain(vertices, bows, rad, rng, 14);
}

/* A pencil underline that dips a little in the middle. */
function underlinePoints(rng, w, h) {
  var bow = rng.gauss(0, 0.6);
  return seg(0.6, h - 2.4, w - 0.6, h - 2.4, bow, Math.max(3, Math.ceil(w / 18)));
}

exports.chain = chain;
exports.boxPoints = boxPoints;
exports.underlinePoints = underlinePoints;
