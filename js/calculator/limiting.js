define(
  ['lib/knockout', 'lib/underscore', './utils', './constants', './resources'],
  function(ko, _, utils, CONSTANTS, resources) {

  function limitFromResource(limit, resource) {
    this.limit = limit;
    this.resource = resource;
    // "write", "owner", "read" are used by ko.computed objects
    this.write = limit;
    this.owner = this;
  }
  _.extend(limitFromResource.prototype, {
    read: function() {
      var used = resources()[this.resource] || 0;
      return _.max([0, this.limit() - used]);
    }
  });

  var _limits = {
        'max_ip': ko.observable(10),
        'max_container_cpu': ko.observable(1000),
        'max_container_mem': ko.observable(1000),
        'max_vm_cpu': ko.observable(1000),
        'max_vm_mem': ko.observable(1000),
      },
      limits = {
        'subscription': {
          'min_container_cpu': ko.observable(0),
          'max_container_cpu': ko.computed(new limitFromResource(
            _limits.max_container_cpu,
            CONSTANTS.RESOURCES_IDS.container_cpu
          )),
          'min_container_mem': ko.observable(0),
          'max_container_mem': ko.computed(new limitFromResource(
            _limits.max_container_mem,
            CONSTANTS.RESOURCES_IDS.container_mem
          )),
          'min_vm_cpu': ko.observable(0),
          'max_vm_cpu': ko.computed(new limitFromResource(
            _limits.max_vm_cpu,
            CONSTANTS.RESOURCES_IDS.vm_cpu
          )),
          'min_vm_mem': ko.observable(0),
          'max_vm_mem': ko.computed(new limitFromResource(
            _limits.max_vm_mem,
            CONSTANTS.RESOURCES_IDS.vm_mem
          )),
          'min_xfer': ko.observable(0),
          'max_xfer': ko.observable(1000),
          'min_disk': ko.observable(0),
          'max_disk': ko.observable(10000),
          'max_ip6': ko.observable(10),
          'max_vlan': ko.observable(10),
          'max_remote_desktops': ko.observable(10),
          'max_ip': ko.computed(new limitFromResource(
            _limits.max_ip,
            CONSTANTS.RESOURCES_IDS.ip
          ))
        },
        'instance': {
          'cpu_min': ko.observable(0),
          'cpu_max': ko.observable(1000),
          'cpu_step': ko.observable(1),
          'mem_min': ko.observable(0),
          'mem_max': ko.observable(1000),
          'mem_step': ko.observable(1),
          'disk_min': ko.observable(0),
          'disk_max': ko.observable(1000)
        }
      };

  function _set(new_limits, pre_limits) {
    _.each(new_limits, function(value, key) {
      var limit = pre_limits[key];

      if (limit)
        limit(value);
    });
  }

  function set(new_limits) {
    _set(new_limits.instance, limits.instance);
    _set(new_limits.subscription, limits.subscription);
    // This is done for as quick fix to allow
    // 0 cpu/ram servers
    limits.instance.cpu_min(0);
    limits.instance.mem_min(0);
  }

  return {
    'limits': limits,
    'set': set
  };
});
