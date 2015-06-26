define(['lib/knockout', 'lib/underscore'], function(ko, _) {

  var MONTHS_HOURS = 24 * 30;

  var PRICES_UNIT_CONVERSIONS = {
    vm_cpu: MONTHS_HOURS / 1000.0,
    vm_mem: MONTHS_HOURS / 1024.0,
    container_cpu: MONTHS_HOURS / 1000.0,
    container_mem: MONTHS_HOURS / 1024.0
  };

  var PRICE_KEYS = [
        'vm_cpu',
        'vm_mem',
        'container_cpu',
        'container_mem',
        'disk',
        'ssd',
        'xfer',
        'ip',
        'vlan',
        'firewall',
        'windows_remote_desktop',
        'windows_server_2008_web',
        'windows_server_2008_standard',
        'windows_server_2008_enterprise',
        'windows_server_2012',
        'microsoft_sql_server_2008_web',
        'microsoft_sql_server_2008_standard',
        'microsoft_sql_server_2012_standard',
        'cpanel_vm'
      ];


  function build_default_prices() {
    var result = {};

    _.each(PRICE_KEYS, function(key) {
      result[key] = ko.observable(0.0);
    });
    return result;
  }

  var prices = build_default_prices(),
      currency = ko.observable('');

  function set_pricing(new_prices) {
    var conversion, price;

    _.each(new_prices, function(value, key) {
      price = prices[key];

      if (price) {
        conversion = PRICES_UNIT_CONVERSIONS[key] || 1.0;
        price(value * conversion);
      }
    });

    if (new_prices['currency'])
      currency(new_prices['currency']);
  }

  return {
    'currency': currency,
    'prices': prices,
    'set': set_pricing,
    'MONTHS_HOURS': MONTHS_HOURS
  };
});
