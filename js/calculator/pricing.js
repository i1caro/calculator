/* globals PRICES, CURRENCY */

define(['lib/knockout', 'lib/underscore'], function(ko, _) {

  var PRICES_UNIT_CONVERSIONS = {
    cpu_virtual_machine_per_mhz: 24 * 30 / 1000.0,
    ram_virtual_machine_per_mb: 24 * 30 / 1024.0,
    cpu_container_per_mhz: 24 * 30 / 1000.0,
    ram_container_per_mb: 24 * 30 / 1024.0,
  };

  var PRICES_MAP = {
    cpu_virtual_machine_per_mhz: 'vm_cpu',
    ram_virtual_machine_per_mb: 'vm_mem',
    cpu_container_per_mhz: 'container_cpu',
    ram_container_per_mb: 'container_mem',

    // Disk/transfer costs.
    hdd_per_gb: 'disk',
    ssd_per_gb: 'ssd',
    bandwidth_per_gb: 'xfer',

    // Extra costs.
    cost_per_static_ip: 'ip',
    cost_per_vlan: 'vlan',
    cost_per_firewall: 'firewall',
    cost_per_desktopcal: 'msft_6wc_00002',
    cost_per_winserverweb: 'msft_lwa_00135',
    cost_per_winserverstd: 'msft_p73_04837',
    cost_per_winserverent: 'msft_p72_04169',
    cost_per_mssqlserverweb: 'msft_tfa_00009',
    cost_per_mssqlserverstd: 'msft_228_03159',
    cost_per_mssqlserver12: 'msft_p73_04837_2012std'
  };

  function build_prices() {
    var result = {};

    _.each(PRICES_MAP, function(value, key) {
      var price = PRICES[value],
          conversion;
      if (_.isUndefined(price))
        result[key] = ko.observable(0.0);
      else {
        conversion = PRICES_UNIT_CONVERSIONS[key] || 1.0;
        result[key] = ko.observable(parseFloat(price) * conversion);
      }
    });

    result['currency'] = ko.observable(CURRENCY);
    return result;
  }

  return build_prices();
});
