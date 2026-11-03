/*
 * Viewport-adaptive UI scale.
 *
 * The Web UI is laid out in fixed CSS pixels, so a small window shows very
 * little content while a large one wastes room. This module keeps a scale
 * factor on the root element (`--ui-scale`), derived from the window size and
 * clamped to a readable range, so the whole shell shrinks a little on small
 * screens and shows more rows/columns instead of pushing them out of view.
 *
 * Overlays that are mounted on <body> (dialogs, context menus, toasts) are
 * deliberately left alone: they are positioned from client coordinates, which
 * are already viewport based.
 */
var BASE_WIDTH = 1800;
var BASE_HEIGHT = 1120;
var MIN_SCALE = 0.85;
var MAX_SCALE = 1;
var VAR_NAME = '--ui-scale';

var zoomSupported =
  typeof CSS !== 'undefined' && CSS.supports && CSS.supports('zoom', '0.9');
var root = document.documentElement;
var currentScale = 1;
var frame = 0;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function computeScale() {
  var ratio = Math.min(
    window.innerWidth / BASE_WIDTH,
    window.innerHeight / BASE_HEIGHT,
    MAX_SCALE
  );
  // 0.05 steps keep the density predictable while the window is resized.
  return Math.round(clamp(ratio, MIN_SCALE, MAX_SCALE) * 20) / 20;
}

function applyScale() {
  frame = 0;
  if (!zoomSupported) {
    return;
  }
  var scale = computeScale();
  if (scale === currentScale && root.style.getPropertyValue(VAR_NAME)) {
    return;
  }
  currentScale = scale;
  root.style.setProperty(VAR_NAME, scale);
}

function schedule() {
  if (frame) {
    return;
  }
  frame = typeof requestAnimationFrame === 'function'
    ? requestAnimationFrame(applyScale)
    : setTimeout(applyScale, 16);
}

exports.getScale = function () {
  return currentScale;
};

applyScale();

// Debounced through requestAnimationFrame: a window drag fires many events.
window.addEventListener('resize', schedule);
window.addEventListener('orientationchange', schedule);
