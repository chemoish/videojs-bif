import jDataView from 'jdataview';

// Offsets

export const BIF_INDEX_OFFSET = 64;
export const FRAMEWISE_SEPARATION_OFFSET = 16;
export const NUMBER_OF_BIF_IMAGES_OFFSET = 12;
export const VERSION_OFFSET = 8;

// Metadata

export const BIF_INDEX_ENTRY_LENGTH = 8;
export const BIF_TIMESTAMP_INTERVAL = 2;

// Magic Number
// SEE: https://sdkdocs.roku.com/display/sdkdoc/Trick+Mode+Support#TrickModeSupport-MagicNumber
export const MAGIC_NUMBER = new Uint8Array([
  '0x89',
  '0x42',
  '0x49',
  '0x46',
  '0x0d',
  '0x0a',
  '0x1a',
  '0x0a',
]);

/**
 * Parsing and read BIF file format.
 *
 * @param {ArrayBuffer} arrayBuffer
 *
 */

export class BIFParser {
  constructor(arrayBuffer) {
    this.arrayBuffer = arrayBuffer;
    this.data = new jDataView(arrayBuffer); // eslint-disable-line new-cap

    // Framewise Separation
    // SEE: https://sdkdocs.roku.com/display/sdkdoc/Trick+Mode+Support#TrickModeSupport-FramewiseSeparation
    this.framewiseSeparation = this.data.getUint32(FRAMEWISE_SEPARATION_OFFSET, true) || 1000;

    // Magic Number
    // SEE: https://sdkdocs.roku.com/display/sdkdoc/Trick+Mode+Support#TrickModeSupport-MagicNumber
    this.magicNumber = new Uint8Array(arrayBuffer).slice(0, 8);

    // Number of BIF images
    // SEE: https://sdkdocs.roku.com/display/sdkdoc/Trick+Mode+Support#TrickModeSupport-NumberofBIFimages
    this.numberOfBIFImages = this.data.getUint32(NUMBER_OF_BIF_IMAGES_OFFSET, true);

    // Version
    // SEE: https://sdkdocs.roku.com/display/sdkdoc/Trick+Mode+Support#TrickModeSupport-Version
    this.version = this.data.getUint32(VERSION_OFFSET, true);

    if (!this.validate()) {
      throw new Error('Invalid BIF file.');
    }

    this.bifIndex = this.generateBIFIndex(true);
  }

  /**
   * Create the BIF index
   * SEE: https://sdkdocs.roku.com/display/sdkdoc/Trick+Mode+Support#TrickModeSupport-BIFindex
   *
   * @returns {Array} bifIndex
   */

  generateBIFIndex() {
    const bifIndex = [];

    for (
      // BIF index starts at byte 64 (BIF_INDEX_OFFSET)
      let i = 0, bifIndexEntryOffset = BIF_INDEX_OFFSET;
      i < this.numberOfBIFImages;
      i += 1, bifIndexEntryOffset += BIF_INDEX_ENTRY_LENGTH
    ) {
      const bifIndexEntryTimestampOffset = bifIndexEntryOffset;
      const bifIndexEntryAbsoluteOffset = bifIndexEntryOffset + 4;

      const nextBifIndexEntryAbsoluteOffset = bifIndexEntryAbsoluteOffset + BIF_INDEX_ENTRY_LENGTH;

      // Documented example, items within `[]`are used to generate the frame.
      // 64, 65, 66, 67 | 68, 69, 70, 71
      // [Frame 0 timestamp] | [absolute offset of frame]
      // 72, 73, 74, 75 | 76, 77, 78, 79
      // Frame 1 timestamp | [absolute offset of frame]
      const offset = this.data.getUint32(bifIndexEntryAbsoluteOffset, true);
      const nextOffset = this.data.getUint32(nextBifIndexEntryAbsoluteOffset, true);
      const timestamp = this.data.getUint32(bifIndexEntryTimestampOffset, true);

      bifIndex.push({
        offset,
        timestamp,

        length: nextOffset - offset,
      });
    }

    return bifIndex;
  }

  /**
   * Return image data for a specific frame of a movie.
   *
   * @param {number} second
   * @param {boolean} wtf if in `wtf` mode and doesn't follow BIF specification
   * @returns {string} imageData
   */

  getImageDataAtSecond(second, wtf = false) {
    // since frames are defined at an interval of BIF_TIMESTAMP_INTERVAL,
    // we need to convert the time into an appropriate frame number.
    const frameNumber = Math.ceil(second / BIF_TIMESTAMP_INTERVAL);

    const frame = this.bifIndex[frameNumber];

    let offset;

    // WTF: dragons—remove me when possible (*should* work when files are fixed and wtf = false)
    // SEE: https://sdkdocs.roku.com/display/sdkdoc/Trick+Mode+Support#TrickModeSupport-Datasection
    //
    // the offset is supposed to be absolute, the start of the frame's image data
    // however, it is relative from the beginning of the file, so we must do that calculation, the
    // `wtf` implementation does not contain any data between the index and the start of the first
    // image, even though the specification says otherwise
    if (wtf) {
      offset = (
        // start of BIF index
        BIF_INDEX_OFFSET +

        // total size of BIF index
        ((this.numberOfBIFImages + 1) * BIF_INDEX_ENTRY_LENGTH) +

        // offset of the current frame from the end of the BIF index
        (frame.offset - this.bifIndex[0].offset)
      );
    } else {
      // things are cool and we are absolute
      offset = frame.offset;
    }

    return `data:image/jpeg;base64,${btoa(String.fromCharCode.apply(null,
      new Uint8Array(this.arrayBuffer.slice(offset, offset + frame.length))
    ))}`;
  }

  /**
   * Validate the file identifier against the magic number.
   *
   */

  validate() {
    let isValid = true;

    MAGIC_NUMBER.forEach((byte, i) => {
      if (byte !== this.magicNumber[i]) {
        isValid = false;

        return;
      }
    });

    return isValid;
  }
}
