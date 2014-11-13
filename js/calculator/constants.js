define(['lib/underscore', './limits', './pricing'], function(_, limits, pricing) {

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
      id: 'mmi-p',
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
  }, {});

  var DOMAINS_TO_LOCATION = {
    'nl': 'ams-e',
    'au': 'hkg-e',
    'hk': 'hkg-e',
    'ca': 'tor-p',
    'uk': 'lon-p',
    'com': 'sjc-c'
  };

  var RESOURCES = {
    'cpu_virtual_machine': 'vm_cpu',
    'ram_virtual_machine': 'vm_mem',
    'cpu_container': 'container_cpu',
    'ram_container': 'container_mem',
    'hdd': 'disk',
    'ssd': 'ssd',
    'ip': 'ip',
    'ip6': 'ip6',
    'vlan': 'vlan',
    'firewall': 'firewall',
    'bandwidth': 'xfer',
    'windows_web_server_2008': 'msft_lwa_00135',
    'windows_web_server_2008_standard': 'msft_p73_04837',
    'windows_web_server_2008_enterprise': 'msft_p72_04169',
    'windows_server_2012_standard': 'msft_p73_04837_2012std',
    'windows_remote_desktop': 'msft_6wc_00002',
    'microsoft_sql_server_2008_web': 'msft_tfa_00009',
    'microsoft_sql_server_2008_standard': 'msft_228_03159'
  };

  var WINDOWS_LICENSE_ORDER = [
    '',
    RESOURCES.windows_web_server_2008,
    RESOURCES.windows_web_server_2008_standard,
    RESOURCES.windows_web_server_2008_enterprise,
    RESOURCES.windows_server_2012_standard
  ];

  var ADDITIONAL_MICROSOFT_LICENSE_ORDER = [
    '',
    RESOURCES.microsoft_sql_server_2008_web,
    RESOURCES.microsoft_sql_server_2008_standard
  ];

  var LICENSES_KEYS = _.union(WINDOWS_LICENSE_ORDER, ADDITIONAL_MICROSOFT_LICENSE_ORDER, [RESOURCES.windows_remote_desktop]);

  var TYPES = {
    'virtual_machine': 'vm',
    'container': 'container',
    'ssd': 'ssd',
    'hdd': 'disk',
  };

  return {
    'RESOURCES': RESOURCES,
    'TYPES': TYPES,
    'WINDOWS_LICENSE_ORDER': WINDOWS_LICENSE_ORDER,
    'ADDITIONAL_MICROSOFT_LICENSE_ORDER': ADDITIONAL_MICROSOFT_LICENSE_ORDER,
    'DOMAINS_TO_LOCATION': DOMAINS_TO_LOCATION,
    'ZONES': ZONES,
    'CONTAINER_UNAVAILABILITY': CONTAINER_UNAVAILABILITY,
    'LICENSES_KEYS': LICENSES_KEYS,
    'LIMITS': limits,
    'PRICES': pricing,
  };
});
