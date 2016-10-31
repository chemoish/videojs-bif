# videojs-bif

> Video.js plugin for supporting BIF.

For more information on BIF, see https://sdkdocs.roku.com/display/sdkdoc/Trick+Mode+Support.

![Example](https://github.com/chemoish/videojs-bif/blob/master/asset/img/example.png?raw=true)

## Getting Started

#### Include

```html
<script src="/path/to/videojs.bif.min.js"></script>
```

#### Enable

```js
// Generally BIF files are large, so you have the ability to manage fetching on your own.
// If this is the route you take, you can update plugin configuration at any time by rerunning the plugin.
//
// See documentation or example for more detail.
videojs('player_id').bif({
  src: '/path/to/bif.bif',
});
```

> Note: There are multiple ways to enable plugins. For more information, please visit [Video.js](https://github.com/videojs/video.js).

## Options

#### createBIFImage

Type: `function`  
Default:

```js
createBIFImage() {
  const BIFImage = document.createElement('img');

  BIFImage.className = 'bif-image';

  return BIFImage;
}
```

Will be updated with new image previews—dependent on the current mouse over time in the video.

#### createBIFTime

Type: `function`  
Default:

```js
createBIFTime() {
  const BIFTime = document.createElement('span');

  BIFTime.className = 'bif-time';

  return BIFTime;
}
```

Will be updated with new time—dependent on the current mouse over time in the video.

#### data

Type: `ArrayBuffer`  

#### template

Type: `function`  
Default:

```js
template() {
  const template = document.createElement('div');

  template.className = 'bif';

  // append image element only if the images are ready
  if (this.hasImages()) {
    template.appendChild(this.BIFImage);
  }

  template.appendChild(this.BIFTime);

  return template;
}
```

Will be updated every time configuration changes—default implementation will show time immediately, then show images when available.

#### url

Type: `string`  

## Contributing + Example

```bash
npm install -g grunt-cli

npm install

npm start
```

## License

Code licensed under [The MIT License](https://github.com/chemoish/videojs-bif/blob/master/LICENSE).
