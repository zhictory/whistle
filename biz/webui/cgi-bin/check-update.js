var properties = require('../../../lib/rules/util').properties;
var config = require('../../../lib/config');
var common = require('../../../lib/util/common');
var localSource = require('../../../lib/local-source').get();

module.exports = function(req, res) {
  var version = config.version;
  var isLocal = !!localSource;
  var doNotShowAgainVersion = properties.get('doNotShowAgainVersion');
  var latestVersion = properties.getLatestVersion('latestVersion');
  var latestClientVersion = properties.getLatestVersion('latestClientVersion');
  var hasNewVersion = common.compareVersion(latestVersion, version);

  res.json({
    ec: 0,
    showUpdate: !isLocal && !config.disableUpdateTips && hasNewVersion > 1 && common.compareVersion(latestVersion, doNotShowAgainVersion) > 1,
    hasNewVersion: !isLocal && hasNewVersion > 0,
    hasUpdater: config.hasUpdater,
    version: config.version,
    latestVersion: isLocal ? '' : latestVersion,
    latestClientVersion: latestClientVersion,
    localSource: localSource
  });
};

