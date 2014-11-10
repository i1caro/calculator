define(['lib/knockout', 'lib/underscore'], function(ko) {
  var LIMITS = {
    cpu_container_min: 0,
    cpu_container_max: 20000, // Mhz
    cpu_increments: 50,
    ram_container_min: 256, // MB
    ram_increments: 64,
    ram_container_max: 32768,
    cpu_vm_min: 500,
    cpu_vm_max: 20000, // Mhz
    ram_vm_min: 256, // MB
    ram_vm_max: 32768,
    hdd_min: 0, // GB
    hdd_max: 1862,
    ssd_min: 0,
    ssd_max: 1862,
    bandwidth_min: 0, // GB
    bandwidth_max: 1000
  };
  var UK_PRICE = {
    cpu_per_mhz: 0.012 *720/1000.0,
    memory_per_mb: 0.016 *720/1024.0,
    cpu_container_per_mhz: 0.005 *720/1000.0,
    memory_container_per_mb: 0.007 *720/1024.0,

    // Disk/transfer costs.
    disk_per_gb: 0.06,
    ssd_per_gb: 0.15,
    bandwidth_per_gb: 0.06,

    // Extra costs.
    cost_per_static_ip:  2.00,
    cost_per_vlan: 5.00,
    cost_per_firewall: 5.00,
    cost_per_winserverweb: 10.00,
    cost_per_winserverstd: 20.00,
    cost_per_winserverent: 45.00,
    cost_per_winserver12: 20.00,
    cost_per_mssqlserverweb: 15.00,
    cost_per_mssqlserverstd: 240.00,
    cost_per_mssqlserver12: 240.00,
    cost_per_desktopcal: 4.00,
    currency: '£'
  };
  var NL_PRICE = {
    cpu_per_mhz: 0.015 *720/1000.0,
    memory_per_mb: 0.02 *720/1024.0,
    cpu_container_per_mhz: 0.006 *720/1000.0,
    memory_container_per_mb: 0.009 *720/1024.0,

    // Disk/transfer costs.
    disk_per_gb: 0.07,
    ssd_per_gb: 0.18,
    bandwidth_per_gb: 0.06,

    // Extra costs.
    cost_per_static_ip:  2.50,
    cost_per_vlan: 6.00,
    cost_per_firewall: 6.00,
    cost_per_winserverweb: 12.00,
    cost_per_winserverstd: 24.00,
    cost_per_winserverent: 55.00,
    cost_per_winserver12: 24.00,
    cost_per_mssqlserverweb: 18.00,
    cost_per_mssqlserverstd: 300.00,
    cost_per_mssqlserver12: 300.00,
    cost_per_desktopcal: 5.00,
    currency: '€'
  };
  var US_LA_PRICE = {
    cpu_per_mhz: 0.018 *720/1000.0,
    memory_per_mb: 0.025 *720/1024.0,
    cpu_container_per_mhz: 0.008 *720/1000.0,
    memory_container_per_mb: 0.011 *720/1024.0,

    // Disk/transfer costs. Quoted in US dollars per month.
    disk_per_gb: 0.10,
    ssd_per_gb: 0.25,
    bandwidth_per_gb: 0.15,

    // Extra costs. Quoted in US dollars per month.
    cost_per_static_ip:  3.00,
    cost_per_vlan: 7.50,
    cost_per_firewall: 7.50,
    cost_per_winserverweb: 15.00,
    cost_per_winserverstd: 30.00,
    cost_per_winserverent: 75.00,
    cost_per_winserver12: 30.00,
    cost_per_mssqlserverweb: 22.50,
    cost_per_mssqlserverstd: 385.00,
    cost_per_mssqlserver12: 385.00,
    cost_per_desktopcal: 5.50,
    currency: '$'
  };
  var US_SAN_JOSE_PRICE = _.clone(US_LA_PRICE),
      US_TEXAS_PRICE = _.clone(US_LA_PRICE),
      CANADA_PRICE = _.clone(US_LA_PRICE),
      HONG_KONG_PRICE = _.clone(US_LA_PRICE),
      AUSTRALIA_PRICE = _.clone(US_LA_PRICE);

  US_SAN_JOSE_PRICE.bandwidth_per_gb = 0.05;
  HONG_KONG_PRICE.bandwidth_per_gb = 0.40;
  AUSTRALIA_PRICE.bandwidth_per_gb = 0.65;

  var COUNTRIES_PRICES = {
    'lon-p': UK_PRICE,
    'lon-b': UK_PRICE,
    'ams-e': NL_PRICE,
    'sjc-c': US_SAN_JOSE_PRICE,
    'lax-p': US_LA_PRICE,
    'sat-p': US_TEXAS_PRICE,
    'tor-p': CANADA_PRICE,
    'hkg-e': HONG_KONG_PRICE,
    'syd-v': AUSTRALIA_PRICE
  };
  var CONTAINER_UNAVAILABILITY = {
    'lon-p': false,
    'lon-b': false,
    'ams-e': false,
    'sjc-c': false,
    'lax-p': false,
    'sat-p': true,
    'tor-p': false,
    'hkg-e': false,
    'syd-v': true
  };
  var ZONES = [
    {
      id: "lon-p",
      name: "London Portsmouth",
      flag: "UKflag.png",
    },
    {
      id: "lon-b",
      name: "London Maidenhead",
      flag: "UKflag.png",
    },
    {
      id: "ams-e",
      name: "Amsterdam",
      flag: "NLFlag.png",
    },
    {
      id: "sjc-c",
      name: "San Jose, CA",
      flag: "USAFlag.png",
    },
    {
      id: "lax-p",
      name: "Los Angeles, CA",
      flag: "USAFlag.png",
    },
    {
      id: "tor-p",
      name: "Toronto",
      flag: "CANFlag.png",
    },
    {
      id: "hkg-e",
      name: "Hong Kong",
      flag: "HKGFlag.png",
    },
    {
      id: "syd-v",
      name: "Sydney",
      flag: "AUSFlag.png",
    }
  ];
  var DOMAINS_TO_LOCATION = {
    'nl': 'ams-e',
    'au': 'hkg-e',
    'hk': 'hkg-e',
    'ca': 'tor-p',
    'uk': 'lon-p',
    'com': 'sjc-c'
  };
  var SUBSCRIPTION_DISCOUNTS = [
    {'name': 'No plan', 'times': 0, 'price': 0},
    {'name': '12 Months', 'times': 12, 'price': 0.10}
  ];
  return {
    'LIMITS': LIMITS,
    'UK_PRICE': UK_PRICE,
    'DOMAINS_TO_LOCATION': DOMAINS_TO_LOCATION,
    'ZONES': ZONES,
    'SUBSCRIPTION_DISCOUNTS': SUBSCRIPTION_DISCOUNTS,
    'CONTAINER_UNAVAILABILITY': CONTAINER_UNAVAILABILITY,
    'COUNTRIES_PRICES': COUNTRIES_PRICES,
  };
});
