/* Geometry helpers for the ink outlines (ported from Looseleaf, MIT). */

var TAU = Math.PI * 2;

/* A straight run with an optional bow, sampled into points. */
function seg(x1, y1, x2, y2, bow, count) {
  bow = bow || 0;
  count = count || 8;
  var dx = x2 - x1;
  var dy = y2 - y1;
  var len = Math.hypot(dx, dy) || 1;
  var nx = -dy / len;
  var ny = dx / len;
  var out = [];
  for (var i = 0; i <= count; i++) {
    var t = i / count;
    var b = bow * Math.sin(Math.PI * t);
    out.push([x1 + dx * t + nx * b, y1 + dy * t + ny * b]);
  }
  return out;
}

/* Points -> a compact SVG path (one decimal is plenty at UI sizes). */
function toPath(points) {
  if (!points || !points.length) {
    return '';
  }
  var d = 'M' + round(points[0][0]) + ' ' + round(points[0][1]);
  for (var i = 1; i < points.length; i++) {
    d += 'L' + round(points[i][0]) + ' ' + round(points[i][1]);
  }
  return d;
}

function round(value) {
  return Math.round(value * 10) / 10;
}

exports.TAU = TAU;
exports.seg = seg;
exports.toPath = toPath;
exports.round = round;
