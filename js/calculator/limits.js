/* globals LIMITS */

define(['lib/underscore'], function(_) {

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

  var LIMITS_MAP = {
    cpu_increments: 'cpu_step',
    cpu_container_min: 'min_cpu_sub',
    cpu_container_max: 'max_container_cpu',
    cpu_vm_min: 'min_cpu_sub',
    cpu_vm_max: 'max_vm_cpu',
    ram_increments: 'ram_step',
    ram_container_min: 'min_mem_sub',
    ram_container_max: 'max_container_mem',
    ram_vm_min: 'min_mem_sub',
    ram_vm_max: 'max_vm_mem',
    hdd_min: 'disk_min',
    hdd_max: 'disk_max',
    ssd_min: 'disk_min',
    ssd_max: 'disk_max',
    bandwidth_min: 'bandwidth_min',
    bandwidth_max: 'bandwidth_min',
    ip_max: 'max_ip',
    ip6_max: 'max_ip6',
    vlan_max: 'max_vlan',
  };

  function build_limits() {
    var result = {};
    _.each(LIMITS_MAP, function(value, key) {
        var limit = LIMITS[value];

        if (_.isUndefined(limit))
          result[key] = DEFAULT_LIMITS[key];
        else
            result[key] = limit;
    });
    return result;
  }

  return build_limits();
});
