var fs = require('fs');
var path = require('path');
var cp = require('child_process');

var cache;

function git(root, args) {
  try {
    return cp.execFileSync('git', args, {
      cwd: root,
      timeout: 1000,
      stdio: ['ignore', 'pipe', 'ignore']
    }).toString().trim();
  } catch (e) {}
}

function getLocalSource() {
  if (cache !== undefined) {
    return cache;
  }
  var root = path.resolve(__dirname, '..');
  var isGit = false;
  try {
    isGit = fs.existsSync(path.join(root, '.git'));
  } catch (e) {}
  if (!isGit) {
    cache = null;
    return cache;
  }
  var branch = git(root, ['rev-parse', '--abbrev-ref', 'HEAD']);
  cache = {
    root: root,
    branch: branch && branch !== 'HEAD' ? branch : '',
    commit: git(root, ['rev-parse', '--short', 'HEAD']) || ''
  };
  return cache;
}

exports.get = getLocalSource;
exports.isLocal = function() {
  return !!getLocalSource();
};
