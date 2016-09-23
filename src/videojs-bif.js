/* global videojs */

import throttle from 'lodash/throttle';
import { BIFParser } from './parser';
import { getPointerPosition } from './util/dom';

let bif;

/**
 *
 *
 * @param {Object} options
 * @param {ArrayBuffer} options.data
 * @param {function(event)} options.onMouseMove
 * @param {Object} options.url
 *
 */

export default class Bif {
  constructor(player, options) {
    this.player = player;

    this.update(options);

    const { progressControl } = player.controlBar;

    this.progressControl = progressControl;

    this.onMouseMove = throttle(this.onMouseMove.bind(this), 25);

    this.player.on(progressControl.el(), 'mousemove', this.onMouseMove);

    this.player.one('dispose', () => {
      this.player.off(progressControl.el(), 'mousemove', this.onMouseMove);
    });
  }

  onMouseMove(event) {
    const position = getPointerPosition(
      event,
      this.progressControl.seekBar.el()
    );

    const time = position.x * this.player.duration();

    this.options.onMouseMove(event, {
      time,

      image: this.bifParser.getImageDataAtSecond(time, true),
    });
  }

  update(options) {
    this.options = videojs.mergeOptions({}, this.options, options);

    const { data } = options;

    if (!(data instanceof ArrayBuffer)) {
      throw new Error('Invalid data');
    }

    this.bifParser = new BIFParser(data);
  }
}

videojs.plugin('bif', function bifPlugin(options = {}) {
  if (bif) {
    bif.update(options);
  } else {
    bif = new Bif(this, options);
  }

  return bif;
});
