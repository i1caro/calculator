define(['lib/knockout', 'lib/underscore'], function(ko, _) {

  var MONTHS_HOURS = 24 * 30;

  var PRICES_UNIT_CONVERSIONS = {
    cpu_virtual_machine_per_mhz: MONTHS_HOURS / 1000.0,
    ram_virtual_machine_per_mb: MONTHS_HOURS / 1024.0,
    cpu_container_per_mhz: MONTHS_HOURS / 1000.0,
    ram_container_per_mb: MONTHS_HOURS / 1024.0,
  };

  var PRICE_KEYS = [
        'cpu_virtual_machine_per_mhz',
        'ram_virtual_machine_per_mb',
        'cpu_container_per_mhz',
        'ram_container_per_mb',
        'hdd_per_gb',
        'ssd_per_gb',
        'bandwidth_per_gb',
        'cost_per_static_ip',
        'cost_per_vlan',
        'cost_per_firewall',
        'cost_per_windows_remote_desktop',
        'cost_per_windows_server_2008_web',
        'cost_per_windows_server_2008_standard',
        'cost_per_windows_server_2008_enterprise',
        'cost_per_windows_server_2012',
        'cost_per_windows_sql_server_2008_web',
        'cost_per_windows_sql_server_2008_standard',
        'cost_per_windows_sql_server_2012_standard'
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
    'set_pricing': set_pricing,
    'MONTHS_HOURS': MONTHS_HOURS
  };
});
