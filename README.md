# Svelte Animation on Scroll
![Publish on NPM](https://github.com/shiryel/saos/workflows/Publish%20on%20NPM/badge.svg)
[![NPM version](https://img.shields.io/npm/v/saos.svg?style=flat)](https://npmjs.org/package/saos)
[![Code Size](https://img.shields.io/github/languages/code-size/shiryel/saos)](https://img.shields.io/github/languages/code-size/shiryel/saos)
![npm](https://img.shields.io/npm/dt/saos)
![LICENSE](https://img.shields.io/github/license/shiryel/saos)

[![Twitter](https://img.shields.io/twitter/follow/shiryel_.svg?style=social)](https://twitter.com/shiryel_)

A very small svelte component to animate your elements on scroll

SAoS allows you to animate once or multiple times a element on scroll, you can define the top and bottom "triggers" and the css of the internal divs (not recomended, but can help in some cases), see below the demo, how install and some examples :smile_cat:

In terms of performance, this lib uses the [Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) for most of the browsers (shame on you Internet Explorer)

### :zap: [Demo](https://shiryel.github.io/saos/)

---

## How to install

- Npm
```
npm i saos --save-dev
```

- Yarn
```
yarn add -D saos
```

Note: **Sapper only supports libs as DEV dependencies**, if you realy want to use this lib as a normal dependency on Sapper make sure to import like this `import Saos from 'saos/src/Saos.svelte';` or otherwise you will have problems with SSR!

## How to use

Basic usage:
- First import the package on Svelte
```js
import Saos from "saos";
```

- Then define your @keyframes animation as a -global- on svelte
```css
@keyframes -global-from-left {
  0% {
    transform: rotateX(50deg) translateX(-200vw) skewX(-50deg);
    opacity: 1;
  }
  100% {
    transform: rotateX(0deg) translateX(0) skewX(0deg);
    opacity: 1;
  }
}
```

- Finally add the keyframe name without the -global- and the others animations params
```html
<Saos animation={"from-left 4s cubic-bezier(0.35, 0.5, 0.65, 0.95) both"}>
  <div><p>animation: from-left</p></div>
</Saos>
```

Beyond the animation param, you can use:
- animation_out -> to play a animation when the element is no more "visible" (use the top and bottom to define this), default: "none; opacity: 0"
- once -> if the animation will be played only one time or multiple times, default: false
- top -> the top of the observer, use a positive value to play the animation after top be visible, default: 0
- bottom -> the bottom of the observer, use a positive value to play the animation after bottom be visible, default: 0
- css_observer -> the css of the div that is the observer, not recomended to use, but is here :cat2:, default: ""
- css_animation -> the css of the div that is the animation, not recomended to use, but is here :cat2:, default: ""

### And we have reactive dispatchs too!

You can do something like:
```js
// Create a handler on your script

function handleObserver(x) {
  console.info(x.detail.observing);
}

// Use the `update` event on your html that will be dispatched every time that the `observing` update!

<Saos on:update={handleObserver}>...</Saos>
```
And it will work! Amazing no? take a look at the last card on our [demo](https://shiryel.github.io/saos/)

### [And you can see a bunch of usage here](https://github.com/shiryel/saos/blob/master/demo/src/Animations.svelte)

If you are lazy (like me) to create your own animations, take a look at [animista](https://animista.net/play/)
