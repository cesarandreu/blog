# Writing Modern JavaScript

If you keep up with the web world you've probably noticed that there's a lot of cool new features coming to JavaScript with ES2015 (also known as ES6). You can write future JavaScript today, using [babel](https://babeljs.io/).

Babel really stands out to me as an example of a great library. It has support for pretty much all the popular tools out there, so you can integrate it with anything.

But you know what the cherry on top is? It has packages to help with syntax highlighting and linting! Oh, and bonus points: it supports JSX, so you can write react.js along with ES2015.

Seriously, this seems like a small detail, but if it's a tool you're using every single day it makes a big difference.

## Editor

Use [Sublime Text 3](https://www.sublimetext.com/3), and make sure you have [Package Control](https://packagecontrol.io/) installed. While you're at it, try [Fira Mono](https://mozilla.github.io/Fira/) as your font (you'll have to scroll down), it's great.

## Syntax highlighting

Install [babel-sublime](https://github.com/babel/babel-sublime) in Sublime Text. Then follow their instructions for `Setting as the default syntax`.

That's it, and you'll get proper syntax highlighting with ES6, JSX, and even future ES7 stuff like async/await!

## Linting

Install [SublimeLinter](https://github.com/SublimeLinter/SublimeLinter3) and [SublimeLinter-eslint](https://github.com/roadhump/SublimeLinter-eslint) in Sublime Text.

Then install install [eslint](http://eslint.org/) and [babel-eslint](https://github.com/babel/babel-eslint). If you're gonna be using JSX, go ahead and install [eslint-plugin-react](eslint-plugin-react) too.

```sh
npm install -g eslint eslint-plugin-react babel-eslint
```

Play around with the example shown in the babel-eslint until you get your `.eslintrc` file exactly how you want it.

To give you an example, one of my project's `.eslintrc` looks like this:

```json
{
  "parser": "babel-eslint",
  "plugins": [
    "react"
  ],
  "rules": {
    "no-console": 0,
    "no-multiple-empty-lines": 0,
    "react/jsx-quotes": [1, "single"],
    "react/no-unknown-property": 1,
    "react/self-closing-comp": 1,
    "react/jsx-uses-react": 1,
    "react/jsx-uses-vars": 1,
    "react/jsx-no-undef": 1
  },
  "env": {
    "browser": true,
    "mocha": true,
    "node": true
  }
}
```

## Go forth and conquer

That's all. You should be good to go and start writing your awesome ES2015 + JSX code!
