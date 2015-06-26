define([
  'lib/underscore',
  './collections',
], function(_, collections) {
  function filter_zeros(resources) {
    return _.reduce(resources, function(memo, value, key) {
      if (value !== 0)
        memo[key] = value;
      return memo;
    }, {});
  }

  function build_resources() {
    var resources = {};
    function add_keys(obj) {
      _.each(obj.resources(), function(value, key) {
        if (!resources[key])
          resources[key] = 0;
        resources[key] += value;
      });
    }

    _.each(collections.disconnected_drives(), add_keys);
    _.each(collections.disconnected_folders(), add_keys);
    _.each(collections.servers(), add_keys);
    if (collections.account_details())
      _.each([collections.account_details()], add_keys);

    return filter_zeros(resources);
  }

  return build_resources;
});
