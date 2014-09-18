#Repository for DroidSize.
>Generate and batch process image resizing for different resolutions in Android.

## Getting Started
This repository requires [node](nodejs.org) `~0.10+` and [express](https://github.com/strongloop/express) `~4.0+`

Install [imageMagick](www.imagemagick.org) for your OS. In Mac, you can do this by:

```js
brew install imageMagick
```

Install all the required packages:

```js
npm install
```
To correctly process png files you need to edit the [node-easyimage](https://github.com/hacksparrow/node-easyimage) module.

Open 'node_modules/easyimage/easyimage.js' and edit the following lines:

```js
if (stderr.match(/^identify:/)) {
			deferred.reject(new Error(error_messages['unsupported']));
		}
```
to match something like this:

```js
if (stderr.match(/^null/)) {
  deferred.reject(new Error(error_messages['unsupported']));
}
```

That is a vey hackish way to do things, but it allows me to process png files without throwing an error.
There is already a [pull request](https://github.com/hacksparrow/node-easyimage/pull/37) that deals with this error, I will try to update accordingly.
