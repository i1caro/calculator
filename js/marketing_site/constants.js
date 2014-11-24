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
    },
    {
      id: 'lax-p',
      name: 'Los Angeles, CA',
      flag: 'USAFlag.png',
    },
    {
      id: 'dal-a',
      name: 'Dallas',
      flag: 'USAFlag.png',
    },
    {
      id: 'mmi-a',
      name: 'Miami',
      flag: 'USAFlag.png',
    },
    {
      id: 'sat-p',
      name: 'San Antonio, TX',
      flag: 'USAFlag.png',
      containers_unavailable: true
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
    },
    {
      id: 'syd-v',
      name: 'Sydney',
      flag: 'AUSFlag.png',
    }
  ];

  var CONTAINER_UNAVAILABILITY = _.reduce(ZONES, function(memo, zone) {
    if (zone.containers_unavailable) {
      memo[zone.id] = zone.containers_unavailable;
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
        cost_per_desktopcal: 4.00,
        cost_per_winserverweb: 10.00,
        cost_per_winserverstd: 20.00,
        cost_per_winserverent: 45.00,
        cost_per_mssqlserverweb: 15.00,
        cost_per_mssqlserverstd: 240.00,
        cost_per_mssqlserver12: 240.00,
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
        cost_per_desktopcal: 5.00,
        cost_per_winserverweb: 12.00,
        cost_per_winserverstd: 24.00,
        cost_per_winserverent: 55.00,
        cost_per_mssqlserverweb: 18.00,
        cost_per_mssqlserverstd: 300.00,
        cost_per_mssqlserver12: 300.00,
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
        bandwidth_per_gb: 0.15,
        // Extra costs
        cost_per_static_ip: 3.00,
        cost_per_vlan: 7.50,
        cost_per_firewall: 7.50,
        cost_per_desktopcal: 5.50,
        cost_per_winserverweb: 15.00,
        cost_per_winserverstd: 30.00,
        cost_per_winserverent: 75.00,
        cost_per_mssqlserverweb: 22.50,
        cost_per_mssqlserverstd: 385.00,
        cost_per_mssqlserver12: 385.00,
        currency: '$'
      };

  var US_SAN_JOSE_PRICE = _.clone(DOLAR_PRICES),
      HONG_KONG_PRICE = _.clone(DOLAR_PRICES),
      AUSTRALIA_PRICE = _.clone(DOLAR_PRICES);

  US_SAN_JOSE_PRICE.bandwidth_per_gb = 0.05;
  HONG_KONG_PRICE.bandwidth_per_gb = 0.40;
  AUSTRALIA_PRICE.bandwidth_per_gb = 0.65;

  var LOCAL_PRICES = {
    'lon-b': POUND_PRICES,
    'lon-p': POUND_PRICES,
    'ams-e': EURO_PRICES,
    'sjc-c': US_SAN_JOSE_PRICE,
    'mmi-a': DOLAR_PRICES,
    'dal-a': DOLAR_PRICES,
    'lax-p': DOLAR_PRICES,
    'sat-p': DOLAR_PRICES,
    'tor-p': DOLAR_PRICES,
    'hkg-e': HONG_KONG_PRICE,
    'syd-v': AUSTRALIA_PRICE
  };


  return {
    'CONTAINER_UNAVAILABILITY': CONTAINER_UNAVAILABILITY,
    'DOMAINS_TO_LOCATION': DOMAINS_TO_LOCATION,
    'LOCAL_PRICES': LOCAL_PRICES,
    'ZONES': ZONES
  };
});