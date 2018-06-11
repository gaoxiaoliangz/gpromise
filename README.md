<a href="https://promisesaplus.com/">
    <img src="https://promisesaplus.com/assets/logo-small.png" alt="Promises/A+ logo"
         title="Promises/A+ 1.0 compliant" align="right" />
</a>

# GPromise

A small promise library implementing the [Promises/A+ spec](http://promises-aplus.github.com/promises-spec/) (Version 1.1).

## Basic Usage

```js
const examplePromise = new GPromise(resolve => {
    setTimeout(() => {
        resolve('done')
    }, 1000)
})

// logs `done` after 1s
examplePromise.then(result => {
    console.log(result)
})

```
