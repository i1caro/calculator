define(['lib/underscore'], function(_) {
  var RESOURCES_LIST = [
    {
      'name': 'CPU (VM)',
      'id': 'vm_cpu',
      'unit': 'core-Mhz',
    },
    {
      'name': 'Memory (VM)',
      'id': 'vm_mem',
      'unit': 'MB',
    },
    {
      'name': 'CPU (Container)',
      'id': 'container_cpu',
      'unit': 'core-Mhz',
    },
    {
      'name': 'Memory (Container)',
      'id': 'container_mem',
      'unit': 'MB',
    },
    {
      'name': 'Disk',
      'id': 'disk',
      'unit': 'GB',
    },
    {
      'name': 'SSD',
      'id': 'ssd',
      'unit': 'GB',
    },
    {
      'name': 'Static IP address',
      'id': 'ip',
      'unit': 'IPs',
    },
    {
      'name': 'Static IPv6 address',
      'id': 'ip6',
      'unit': 'IPs',
    },
    {
      'name': 'Private network VLAN',
      'id': 'vlan',
      'unit': 'VLANs',
    },
    {
      'name': 'Firewall',
      'id': 'firewall',
      'unit': 'Firewall',
    },
    {
      'name': 'Committed data transfer',
      'id': 'xfer',
      'unit': 'GB per month',
    },
    {
      'name': 'Windows Remote Desktop Services SAL',
      'id': 'windows_remote_desktop',
      'unit': 'license',
      'resource_id': 'msft_6wc_00002'
    },
    {
      'name': 'Windows Web Server 2008 (orig. or R2)',
      'id': 'windows_server_2008_web',
      'unit': 'license',
      'resource_id': 'msft_lwa_00135'
    },
    {
      'name': 'Windows Server 2008 Standard (orig. or R2)',
      'id': 'windows_server_2008_standard',
      'unit': 'license',
      'resource_id': 'msft_p73_04837'
    },
    {
      'name': 'Windows Server 2008 Enterprise (orig. or R2)',
      'id': 'windows_server_2008_enterprise',
      'unit': 'license',
      'resource_id': 'msft_p72_04169'
    },
    {
      'name': 'Windows Server 2012 Standard',
      'id': 'windows_server_2012',
      'unit': 'license',
      'resource_id': 'msft_p73_04837_2012std'
    },
    {
      'name': ' Microsoft SQL Server 2008 Web',
      'id': 'microsoft_sql_server_2008_web',
      'unit': 'license',
      'resource_id': 'msft_tfa_00009'
    },
    {
      'name': 'Microsoft SQL Server 2008 Standard',
      'id': 'microsoft_sql_server_2008_standard',
      'unit': 'license',
      'resource_id': 'msft_228_03159'
    },
    {
      'name': 'Microsoft SQL Server 2012 Standard',
      'id': 'microsoft_sql_server_2012_standard',
      'unit': 'license',
      'resource_id': undefined
    },
    {
      'name': 'cPanel VPS licence (for VMs)',
      'id': 'cpanel_vm',
      'unit': 'license',
      'resource_id': 'cpanel_vps_1m'
    },
    {
      'name': 'cPanel dedicated server licence (for containers)',
      'id': 'cpanel_container',
      'unit': 'license',
      'resource_id': 'cpanel_ded_1m'
    }
  ];

  var RESOURCES = _.reduce(
        RESOURCES_LIST,
        function(memo, data) {
          memo[data.id] = data;
          return memo;
        },
        {}
      );

  var RESOURCES_IDS = {};

  _.each(RESOURCES_LIST, function(line) {
    if (line.resource_id)
      RESOURCES_IDS[line.id] = line.resource_id;
    else
      RESOURCES_IDS[line.id] = line.id;
  });

  var WINDOWS_LICENSE_ORDER = [
    RESOURCES.windows_server_2008_web,
    RESOURCES.windows_server_2008_standard,
    RESOURCES.windows_server_2008_enterprise,
    RESOURCES.windows_server_2012
  ];

  var ADDITIONAL_LICENSE_ORDER = [
    RESOURCES.microsoft_sql_server_2008_web,
    RESOURCES.microsoft_sql_server_2008_standard,
    // RESOURCES.microsoft_sql_server_2012_standard,
    RESOURCES.cpanel_vm
  ];

  var LICENSES_KEYS = _.union(WINDOWS_LICENSE_ORDER, ADDITIONAL_LICENSE_ORDER, [RESOURCES.windows_remote_desktop]);

  return {
    'RESOURCES_IDS': RESOURCES_IDS,
    'RESOURCES': RESOURCES,
    'WINDOWS_LICENSE_ORDER': WINDOWS_LICENSE_ORDER,
    'ADDITIONAL_LICENSE_ORDER': ADDITIONAL_LICENSE_ORDER,
    'LICENSES_KEYS': LICENSES_KEYS,
  };
});
