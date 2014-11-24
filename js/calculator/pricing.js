define(['lib/knockout', 'lib/underscore'], function(ko, _) {

  var PRICES_UNIT_CONVERSIONS = {
    cpu_virtual_machine_per_mhz: 24 * 30 / 1000.0,
    ram_virtual_machine_per_mb: 24 * 30 / 1024.0,
    cpu_container_per_mhz: 24 * 30 / 1000.0,
    ram_container_per_mb: 24 * 30 / 1024.0,
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
        'cost_per_desktopcal',
        'cost_per_winserverweb',
        'cost_per_winserverstd',
        'cost_per_winserverent',
        'cost_per_mssqlserverweb',
        'cost_per_mssqlserverstd',
        'cost_per_mssqlserver12'
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
    'set_pricing': set_pricing
  };
});
