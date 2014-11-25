define(['lib/underscore'], function(_) {

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

  var DEFAULT_LIMITS = {
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
    'RESOURCES': RESOURCES,
    'TYPES': TYPES,
    'WINDOWS_LICENSE_ORDER': WINDOWS_LICENSE_ORDER,
    'ADDITIONAL_MICROSOFT_LICENSE_ORDER': ADDITIONAL_MICROSOFT_LICENSE_ORDER,
    'LICENSES_KEYS': LICENSES_KEYS,
    'DEFAULT_LIMITS': DEFAULT_LIMITS,
  };
});
