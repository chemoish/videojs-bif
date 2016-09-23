/**
 *
 * SEE: https://github.com/videojs/video.js/blob/4f6cb03adde9ddf800e2ecf6fa87b07d436b74e8/src/js/utils/dom.js#L438
 *
 */

export function getElementPosition(element) {
  let elementPosition = {
    left: 0,
    top: 0,
  };

  if (element.getBoundingClientRect && element.parentNode) {
    elementPosition = element.getBoundingClientRect();
  }

  const {
    body,
    documentElement,
  } = document;

  const clientLeft = documentElement.clientLeft || body.clientLeft || 0;
  const scrollLeft = window.pageXOffset || body.scrollLeft;

  const clientTop = documentElement.clientTop || body.clientTop || 0;
  const scrollTop = window.pageYOffset || body.scrollTop;

  // Android sometimes returns slightly off decimal values, so need to round
  return {
    left: Math.round(elementPosition.left + (scrollLeft - clientLeft)),
    top: Math.round(elementPosition.top + (scrollTop - clientTop)),
  };
}

/**
 *
 * SEE: https://github.com/videojs/video.js/blob/4f6cb03adde9ddf800e2ecf6fa87b07d436b74e8/src/js/utils/dom.js#L480
 *
 */

export function getPointerPosition(event, element) {
  const elementPosition = getElementPosition(element);

  const elementWidth = element.offsetWidth;
  const elementHeight = element.offsetHeight;

  let {
    pageX,
    pageY,
  } = event;

  if (event.changedTouches) {
    ({
      pageX,
      pageY,
    } = event.changedTouches[0]);
  }

  return {
    x: Math.max(0, Math.min(1, (pageX - elementPosition.left) / elementWidth)),
    y: Math.max(0, Math.min(1, ((elementPosition.top - pageY) + elementHeight) / elementHeight)),
  };
}
