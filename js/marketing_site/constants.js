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
        vm_cpu: 0.012,
        vm_mem: 0.016,
        container_cpu: 0.005,
        container_mem: 0.007,
        // Disk/transfer costs.
        disk: 0.06,
        ssd: 0.15,
        xfer: 0.06,
        // Extra costs
        ip: 2.00,
        vlan: 5.00,
        firewall: 5.00,
        windows_remote_desktop: 4.00,
        windows_server_2008_web: 10.00,
        windows_server_2008_standard: 20.00,
        windows_server_2008_enterprise: 45.00,
        windows_server_2012: 20.00,
        microsoft_sql_server_2008_web: 15.00,
        microsoft_sql_server_2008_standard: 240.00,
        microsoft_sql_server_2012_standard: 240.00,
        cpanel_vm: 13.00,
        currency: '£'
      },
      EURO_PRICES = {
        vm_cpu: 0.015,
        vm_mem: 0.02,
        container_cpu: 0.006,
        container_mem: 0.009,
        // Disk/transfer costs.
        disk: 0.07,
        ssd: 0.18,
        xfer: 0.06,
        // Extra costs
        ip: 2.50,
        vlan: 6.00,
        firewall: 6.00,
        windows_remote_desktop: 5.00,
        windows_server_2008_web: 12.00,
        windows_server_2008_standard: 24.00,
        windows_server_2008_enterprise: 55.00,
        windows_server_2012: 24.00,
        microsoft_sql_server_2008_web: 18.00,
        microsoft_sql_server_2008_standard: 300.00,
        microsoft_sql_server_2012_standard: 300.00,
        cpanel_vm: 18.00,
        currency: '€'
      },
      DOLAR_PRICES = {
        vm_cpu: 0.018,
        vm_mem: 0.025,
        container_cpu: 0.008,
        container_mem: 0.011,
        // Disk/transfer costs.
        disk: 0.10,
        ssd: 0.25,
        xfer: 0.05,
        // Extra costs
        ip: 3.00,
        vlan: 7.50,
        firewall: 7.50,
        windows_remote_desktop: 5.50,
        windows_server_2008_web: 15.00,
        windows_server_2008_standard: 30.00,
        windows_server_2008_enterprise: 75.00,
        windows_server_2012: 30.00,
        microsoft_sql_server_2008_web: 22.50,
        microsoft_sql_server_2008_standard: 385.00,
        microsoft_sql_server_2012_standard: 385.00,
        cpanel_vm: 20.00,
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
    'instance': {
      'cpu_min': 0,
      'cpu_max': 20000,
      'cpu_step': 50,
      'mem_min': 0,
      'mem_max': 8192,
      'mem_step': 128,
      'disk_min': 0,
      'disk_max': 1862
    },
    'subscription': {
      'min_container_cpu': 0,
      'max_container_cpu': 100000,
      'min_vm_cpu': 0,
      'max_vm_cpu': 100000,
      'min_container_mem': 0,
      'max_container_mem': 32768,
      'min_vm_mem': 0,
      'max_vm_mem': 65536,
      'min_xfer': 0,
      'max_xfer': 1000,
      'max_remote_desktops': 10,
      'max_ip': 12,
      'max_ip6': 12,
      'max_vlan': 5
    }
  };

  var AVAILABLE_ITEMS = {
    'virtual_machine': true,
    'drives': {
      'ssd': true,
      'hdd': true
    },
    'container': true,
    'folders': {
      'ssd': true,
      'hdd': true
    }
   };
  return {
    'FREE_BANDWIDTH': FREE_BANDWIDTH,
    'DOMAINS_TO_LOCATION': DOMAINS_TO_LOCATION,
    'LIMITS': LIMITS,
    'LOCAL_PRICES': LOCAL_PRICES,
    'ZONES': ZONES,
    'AVAILABLE_ITEMS': AVAILABLE_ITEMS
  };
});
