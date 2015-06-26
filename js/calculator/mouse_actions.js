define(['./utils'], function(utils) {

  function move_handler(event) {
    var data = event.data,
        mouse_move = ((event.clientX - data.offset) * 100) / data.bar_size,
        distance = utils.trim(data.start + mouse_move, 0, 100);
    data.element(distance);
  }
  function stop_move_handler(event) {
    $(document).off('mousemove', move_handler);
  }

  function start_mouse_down(data, event, element, lower_bound) {
    $(document).on('mousemove', {
      offset: event.pageX - utils.pageOffset(),
      start: element(),
      bar_size: $(event.currentTarget).parent().width(),
      element: element,
      lower_bound: lower_bound
    }, move_handler);
    $(document).one('mouseup', stop_move_handler);
  }

  function get_click_position(event) {
    var parent_position = get_position(event.currentTarget),
        x = event.clientX - parent_position.x,
        y = event.clientY - parent_position.y;
    return {x: x, y: y};
  }

  function get_position(element) {
    var x = 0,
        y = 0;

    while (element) {
      x += (element.offsetLeft - element.scrollLeft + element.clientLeft);
      y += (element.offsetTop - element.scrollTop + element.clientTop);
      element = element.offsetParent;
    }
    return {x: x, y: y};
  }

  function click_handle_down(data, event) {
    start_mouse_down(data, event, data.percentage);
  }

  function click_slider_down(data, event) {
    var position = get_click_position(event),
        clicked = position.x / $(event.currentTarget).width() * 100;
    data.percentage(clicked);

    click_handle_down(data, event);
  }

  return {
    'click_handle_down': click_handle_down,
    'click_slider_down': click_slider_down
  };
});
