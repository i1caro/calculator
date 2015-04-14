define(['lib/underscore'], function(_) {

  var DOMAINS_TO_LOCATION = {
    'nl': 'ams-e',
    'au': 'hkg-e',
    'hk': 'hkg-e',
    'ca': 'tor-p',
    'uk': 'lon-p',
    'com': 'sjc-c'
  };

  var ZONES = [
    {
      id: 'lon-p',
      name: 'London Portsmouth',
      flag: 'UKflag.png',
    },
    {
      id: 'lon-b',
      name: 'London Maidenhead',
      flag: 'UKflag.png',
    },
    {
      id: 'ams-e',
      name: 'Amsterdam',
      flag: 'NLFlag.png',
    },
    {
      id: 'sjc-c',
      name: 'San Jose, CA',
      flag: 'USAFlag.png',
      free_bandwidth: 1000,
    },
    {
      id: 'lax-p',
      name: 'Los Angeles, CA',
      flag: 'USAFlag.png',
    },
    {
      id: 'dal-a',
      name: 'Dallas, TX',
      flag: 'USAFlag.png',
      free_bandwidth: 1000,
    },
    {
      id: 'mmi-a',
      name: 'Miami, FL',
      flag: 'USAFlag.png',
      free_bandwidth: 1000,
    },
    {
      id: 'tor-p',
      name: 'Toronto',
      flag: 'CANFlag.png',
    },
    {
      id: 'hkg-e',
      name: 'Hong Kong',
      flag: 'HKGFlag.png',
      free_bandwidth: 100,
    },
    {
      id: 'syd-v',
      name: 'Sydney',
      flag: 'AUSFlag.png',
    }
  ];

  var FREE_BANDWIDTH = _.reduce(ZONES, function(memo, zone) {
    if (zone.free_bandwidth) {
      memo[zone.id] = zone.free_bandwidth;
    }
    return memo;
  }, {});

  // Globals
  var POUND_PRICES = {
        cpu_virtual_machine_per_mhz: 0.012,
        ram_virtual_machine_per_mb: 0.016,
        cpu_container_per_mhz: 0.005,
        ram_container_per_mb: 0.007,
        // Disk/transfer costs.
        hdd_per_gb: 0.06,
        ssd_per_gb: 0.15,
        bandwidth_per_gb: 0.06,
        // Extra costs
        cost_per_static_ip: 2.00,
        cost_per_vlan: 5.00,
        cost_per_firewall: 5.00,
        cost_per_windows_server_2008_web: 10.00,
        cost_per_windows_server_2008_standard: 20.00,
        cost_per_windows_server_2008_enterprise: 45.00,
        cost_per_windows_server_2012: 20.00,
        cost_per_windows_sql_server_2008_web: 15.00,
        cost_per_windows_sql_server_2008_standard: 240.00,
        cost_per_windows_sql_server_2012_standard: 240.00,
        cost_per_windows_remote_desktop: 4.00,
        cost_per_cpanel: 13.00,
        currency: '£'
      },
      EURO_PRICES = {
        cpu_virtual_machine_per_mhz: 0.015,
        ram_virtual_machine_per_mb: 0.02,
        cpu_container_per_mhz: 0.006,
        ram_container_per_mb: 0.009,
        // Disk/transfer costs.
        hdd_per_gb: 0.07,
        ssd_per_gb: 0.18,
        bandwidth_per_gb: 0.06,
        // Extra costs
        cost_per_static_ip: 2.50,
        cost_per_vlan: 6.00,
        cost_per_firewall: 6.00,
        cost_per_windows_server_2008_web: 12.00,
        cost_per_windows_server_2008_standard: 24.00,
        cost_per_windows_server_2008_enterprise: 55.00,
        cost_per_windows_server_2012: 24.00,
        cost_per_windows_sql_server_2008_web: 18.00,
        cost_per_windows_sql_server_2008_standard: 300.00,
        cost_per_windows_sql_server_2012_standard: 300.00,
        cost_per_windows_remote_desktop: 5.00,
        cost_per_cpanel: 18.00,
        currency: '€'
      },
      DOLAR_PRICES = {
        cpu_virtual_machine_per_mhz: 0.018,
        ram_virtual_machine_per_mb: 0.025,
        cpu_container_per_mhz: 0.008,
        ram_container_per_mb: 0.011,
        // Disk/transfer costs.
        hdd_per_gb: 0.10,
        ssd_per_gb: 0.25,
        bandwidth_per_gb: 0.05,
        // Extra costs
        cost_per_static_ip: 3.00,
        cost_per_vlan: 7.50,
        cost_per_firewall: 7.50,
        cost_per_windows_server_2008_web: 15.00,
        cost_per_windows_server_2008_standard: 30.00,
        cost_per_windows_server_2008_enterprise: 75.00,
        cost_per_windows_server_2012: 30.00,
        cost_per_windows_sql_server_2008_web: 22.50,
        cost_per_windows_sql_server_2008_standard: 385.00,
        cost_per_windows_sql_server_2012_standard: 385.00,
        cost_per_windows_remote_desktop: 5.50,
        cost_per_cpanel: 20.00,
        currency: '$'
      };

  var US_TEXAS_PRICE = _.clone(DOLAR_PRICES),
      HONG_KONG_PRICE = _.clone(DOLAR_PRICES),
      CANADA_PRICE = _.clone(DOLAR_PRICES),
      AUSTRALIA_PRICE = _.clone(DOLAR_PRICES);

  AUSTRALIA_PRICE.currency = "USD $";
  HONG_KONG_PRICE.currency = "USD $";
  CANADA_PRICE.currency = "USD $";

  US_TEXAS_PRICE.bandwidth_per_gb = 0.15;
  HONG_KONG_PRICE.bandwidth_per_gb = 0.05;
  AUSTRALIA_PRICE.bandwidth_per_gb = 0.25;

  var LOCAL_PRICES = {
    'lon-b': POUND_PRICES,
    'lon-p': POUND_PRICES,
    'ams-e': EURO_PRICES,
    'sjc-c': DOLAR_PRICES,
    'mmi-a': DOLAR_PRICES,
    'dal-a': DOLAR_PRICES,
    'lax-p': US_TEXAS_PRICE,
    'tor-p': CANADA_PRICE,
    'hkg-e': HONG_KONG_PRICE,
    'syd-v': AUSTRALIA_PRICE
  };

  var LIMITS = {
    cpu_increments: 50,
    cpu_container_min: 500,
    cpu_container_max: 20000, // Mhz
    cpu_vm_min: 500,
    cpu_vm_max: 20000, // Mhz
    ram_increments: 128,
    ram_container_min: 256, // MB
    ram_container_max: 32768,
    ram_vm_min: 256, // MB
    ram_vm_max: 32768,
    hdd_min: 0, // GB
    hdd_max: 1862,
    ssd_min: 0,
    ssd_max: 1862,
    bandwidth_min: 0, // GB
    bandwidth_max: 1000,
    ip_max: 12,
    ip6_max: 12,
    vlan_max: 5,
  };

  return {
    'FREE_BANDWIDTH': FREE_BANDWIDTH,
    'DOMAINS_TO_LOCATION': DOMAINS_TO_LOCATION,
    'LIMITS': LIMITS,
    'LOCAL_PRICES': LOCAL_PRICES,
    'ZONES': ZONES
  };
});
