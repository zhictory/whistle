var storage = require('./storage');

var DEFAULT_SKIN = 'morandi';
var STORAGE_KEY = 'uiSkin';
var SKINS = [
  {
    name: 'Morandi Soft',
    value: 'morandi'
  },
  {
    name: 'Clean Modern',
    value: 'clean'
  },
  {
    name: 'Playful Flat',
    value: 'playful'
  },
  {
    name: 'Retro Terminal',
    value: 'retro'
  }
];
var SKIN_MAP = {};

SKINS.forEach(function(skin) {
  SKIN_MAP[skin.value] = true;
});

function normalize(value) {
  value = value ? String(value).trim().toLowerCase() : '';
  return SKIN_MAP[value] ? value : '';
}

function getQuerySkin() {
  var match = /[?&]uiSkin=([^&#]+)/.exec(window.location.search);
  if (!match) {
    return '';
  }
  try {
    return normalize(decodeURIComponent(match[1]));
  } catch (e) {
    return '';
  }
}

function apply(value) {
  var skin = normalize(value) || DEFAULT_SKIN;
  document.documentElement.setAttribute('data-ui-skin', skin);
  return skin;
}

exports.DEFAULT_SKIN = DEFAULT_SKIN;
exports.SKINS = SKINS;
exports.normalize = normalize;
exports.apply = apply;
exports.getCurrent = function() {
  return normalize(document.documentElement.getAttribute('data-ui-skin'))
    || normalize(storage.get(STORAGE_KEY)) || DEFAULT_SKIN;
};
exports.set = function(value) {
  var skin = apply(value);
  storage.set(STORAGE_KEY, skin);
  return skin;
};
exports.init = function() {
  return apply(getQuerySkin() || storage.get(STORAGE_KEY) || DEFAULT_SKIN);
};
