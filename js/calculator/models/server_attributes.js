define(['lib/knockout', 'lib/underscore', '../pricing', '../limiting', './components'],
  function(ko, _, pricing, limiting, Components) {
    var prices = pricing.prices,
        limits = limiting.limits;

    function SaticIP(checked) {
      Components.Checkbox.call(this, {
        name: 'Static IP',
        checked: checked,
        price: prices.ip,
        active: limits.subscription.max_ip
      });
    }
    _.extend(SaticIP.prototype, Components.Checkbox.prototype);

    function Firewall(checked) {
      Components.Checkbox.call(this, {
        name: 'Firewall',
        checked: checked,
        price: prices.firewall
      });
    }
    _.extend(Firewall.prototype, Components.Checkbox.prototype);

    function CpuVirtualMachine(value) {
      Components.LimitedSlider.call(this, {
        name: 'CPU',
        min: limits.instance.cpu_min,
        max: limits.instance.cpu_max,
        limit: limits.subscription.max_vm_cpu,
        value: value,
        price: prices.vm_cpu,
        step: limits.instance.cpu_step,
        unit: 'MHz'
      });
    }
    _.extend(CpuVirtualMachine.prototype, Components.LimitedSlider.prototype);

    function CpuContainer(value) {
      Components.LimitedSlider.call(this, {
        name: 'CPU',
        min: limits.instance.cpu_min,
        max: limits.instance.cpu_max,
        limit: limits.subscription.max_container_cpu,
        value: value,
        price: prices.container_cpu,
        step: limits.instance.cpu_step,
        unit: 'MHz'
      });
    }
    _.extend(CpuContainer.prototype, Components.LimitedSlider.prototype);

    function RamVirtualMachine(value) {
      Components.LimitedSlider.call(this, {
        name: 'RAM',
        min: limits.instance.mem_min,
        max: limits.instance.mem_max,
        limit: limits.subscription.max_vm_mem,
        value: value,
        price: prices.vm_mem,
        step: limits.instance.mem_step,
        unit: 'MB'
      });
    }
    _.extend(RamVirtualMachine.prototype, Components.LimitedSlider.prototype);

    function RamContainer(value) {
      Components.LimitedSlider.call(this, {
        name: 'RAM',
        min: limits.instance.mem_min,
        max: limits.instance.mem_max,
        limit: limits.subscription.max_container_mem,
        value: value,
        price: prices.container_mem,
        step: limits.instance.mem_step,
        unit: 'MB'
      });
    }
    _.extend(RamContainer.prototype, Components.LimitedSlider.prototype);

    return {
      SaticIP: SaticIP,
      Firewall: Firewall,
      CpuVirtualMachine: CpuVirtualMachine,
      CpuContainer: CpuContainer,
      RamVirtualMachine: RamVirtualMachine,
      RamContainer: RamContainer
    };
  }
);
