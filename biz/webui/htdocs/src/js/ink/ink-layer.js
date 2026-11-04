/*
 * Paints the hand-drawn outline on top of the controls while the looseleaf skin
 * is active: every matched control gets one absolutely positioned <svg> sibling
 * whose path comes from the ported ink engine. Nothing is drawn for the other
 * skins, and the layer tears itself down when the skin changes.
 */

var outline = require('./outline');

var SKIN = 'looseleaf';
var SVG_NS = 'http://www.w3.org/2000/svg';
var SELECTOR = [
  'button.btn',
  'button.w-tab-btn',
  'button.nav-link',
  'a.nav-link',
  'input.form-control',
  'input.fill',
  'select.form-select'
].join(',');
var SKIP = /(^|\s)(btn-close|w-dock-btn)(\s|$)/;
var MAX_NODES = 600;

var enabled = false;
var scheduled = false;
var seedCounter = 0;
var observer = null;

function keyOf(el) {
  if (!el.__inkKey) {
    el.__inkKey = (el.tagName + '|' + (el.className || '') + '|' + seedCounter++);
  }
  return el.__inkKey;
}

function isCandidate(el) {
  if (!el || el.nodeType !== 1) {
    return false;
  }
  if (SKIP.test(el.className || '')) {
    return false;
  }
  var w = el.offsetWidth;
  var h = el.offsetHeight;
  return w > 10 && h > 8 && w * h > 200;
}

function draw(el) {
  if (!isCandidate(el)) {
    return;
  }
  var w = el.offsetWidth;
  var h = el.offsetHeight;
  var key = keyOf(el);
  var box = outline.build(key, w, h);
  var svg = el.__inkSvg;
  if (svg && svg.parentNode !== el) {
    el.__inkSvg = null;
    el.classList.remove('ink-decorated');
    svg = null;
  }
  if (!svg) {
    svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'ink-outline');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    svg.setAttribute('preserveAspectRatio', 'none');
    var path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'currentColor');
    path.setAttribute('stroke-width', '1.3');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('vector-effect', 'non-scaling-stroke');
    svg.appendChild(path);
    // A faint second pass: the pencil doubling back over the same line.
    var echo = document.createElementNS(SVG_NS, 'path');
    echo.setAttribute('fill', 'none');
    echo.setAttribute('stroke', 'currentColor');
    echo.setAttribute('stroke-width', '0.9');
    echo.setAttribute('stroke-linecap', 'round');
    echo.setAttribute('opacity', '0.45');
    echo.setAttribute('transform', 'translate(0.6 -0.5)');
    svg.appendChild(echo);
    var mark = document.createElementNS(SVG_NS, 'path');
    mark.setAttribute('class', 'ink-outline-mark');
    mark.setAttribute('fill', 'none');
    mark.setAttribute('stroke', 'currentColor');
    mark.setAttribute('stroke-width', '2.4');
    mark.setAttribute('stroke-linecap', 'round');
    svg.appendChild(mark);
    el.appendChild(svg);
    el.__inkSvg = svg;
    el.classList.add('ink-decorated');
    el.__inkW = 0;
    el.__inkH = 0;
  }
  var active = /(^|\s)(active|w-active)(\s|$)/.test(el.className || '');
  if (el.__inkW === w && el.__inkH === h && el.__inkActive === active) {
    return;
  }
  el.__inkW = w;
  el.__inkH = h;
  el.__inkActive = active;
  svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
  svg.firstChild.setAttribute('d', box.d);
  svg.children[1].setAttribute('d', box.d);
  var mark = svg.lastChild;
  if (active) {
    mark.setAttribute('d', outline.underline(key, w, h).d);
  } else {
    mark.setAttribute('d', '');
  }
}

function clear(el) {
  if (el.__inkSvg) {
    if (el.__inkSvg.parentNode) {
      el.__inkSvg.parentNode.removeChild(el.__inkSvg);
    }
    el.__inkSvg = null;
    el.classList.remove('ink-decorated');
  }
}

function scan() {
  scheduled = false;
  if (!enabled) {
    return;
  }
  var nodes = document.querySelectorAll(SELECTOR);
  var drawn = 0;
  for (var i = 0; i < nodes.length && drawn < MAX_NODES; i++) {
    draw(nodes[i]);
    drawn++;
  }
}

function schedule() {
  if (!enabled || scheduled) {
    return;
  }
  scheduled = true;
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(scan);
  } else {
    setTimeout(scan, 16);
  }
}

function onResize() {
  if (!enabled) {
    return;
  }
  var nodes = document.querySelectorAll('.ink-decorated');
  for (var i = 0; i < nodes.length; i++) {
    nodes[i].__inkW = 0;
  }
  schedule();
}

function start() {
  if (!enabled || !document.body) {
    return;
  }
  if (window.MutationObserver && !observer) {
    observer = new MutationObserver(function () {
      schedule();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
  window.addEventListener('resize', onResize);
  document.addEventListener('scroll', schedule, true);
  schedule();
  setTimeout(schedule, 120);
  setTimeout(schedule, 500);
  setTimeout(schedule, 1500);
}

function enable() {
  if (enabled) {
    return;
  }
  enabled = true;
  if (document.body) {
    start();
  } else if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', start);
  }
}

function disable() {
  if (!enabled) {
    return;
  }
  enabled = false;
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  window.removeEventListener('resize', onResize);
  document.removeEventListener('scroll', schedule, true);
  var nodes = document.querySelectorAll('.ink-decorated');
  for (var i = 0; i < nodes.length; i++) {
    clear(nodes[i]);
  }
  var strays = document.querySelectorAll('.ink-outline');
  for (var j = 0; j < strays.length; j++) {
    if (strays[j].parentNode) {
      strays[j].parentNode.removeChild(strays[j]);
    }
  }
}

function sync(skin) {
  if (skin === SKIN) {
    enable();
  } else {
    disable();
  }
}

exports.sync = sync;
exports.refresh = schedule;
exports.isEnabled = function () {
  return enabled;
};
