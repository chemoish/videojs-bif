/* global videojs */

/* eslint-disable no-underscore-dangle */

/**
 * Register component.
 */

import bifMouseTimeDisplay from './component/bif-mouse-time-display';

videojs.registerComponent('BIFMouseTimeDisplay', bifMouseTimeDisplay);

/**
 * Replace component implementation.
 */

const VjsSeekBar = videojs.getComponent('SeekBar');

const vjsSeekBarChildren = VjsSeekBar.prototype.options_.children;

const mouseTimeDisplayIndex = vjsSeekBarChildren.indexOf('mouseTimeDisplay');

vjsSeekBarChildren.splice(mouseTimeDisplayIndex, 1, 'BIFMouseTimeDisplay');

/**
 * Register plugin for easier component configurability.
 *
 * @param {Object} [options]
 * @param {ArrayBuffer} options.data
 * @param {function} options.createBIFImage
 * @param {function} options.createBIFTime
 * @param {function} options.template
 * @param {string} options.src
 * @param {boolean} options.wtf
 */
videojs.plugin('bif', function bifPlugin(options = {}) {
  const { BIFMouseTimeDisplay } = this.player_.controlBar.progressControl.seekBar;

  if (options.src) {
    const request = new XMLHttpRequest();

    request.open('GET', options.src, true);
    request.responseType = 'arraybuffer';

    request.onload = (event) => {
      BIFMouseTimeDisplay.render({
        ...options,

        data: event.target.response,
      });
    };

    request.send(null);

    return;
  }

  BIFMouseTimeDisplay.render(options);
});
