# A Reasonable Starting Point for Building a Web App

**tl;dr:** Check out my [web-app](https://github.com/cesarandreu/web-app) repo.

Building modern web apps continues to become increasingly complicated with the massive amounts of frameworks and tools. How can you possibly keep up with everything? What tools should you be using? What does a good development environment look like?

## Backstory

A coworker asked me what he should use to build a web app, and I wasn't sure in what direction to point him in. This is what motivated me to set this up.

The truth is that there's a TON of tools out there, and nobody ever bother showing you how to wire everything up so that you can actually build whatever it is that you want to build! You don't care about X or Y tool or technology, you want to get things done.

## Solution

I prepared this [web-app](https://github.com/cesarandreu/web-app) repo. It provides what I consider to be a reasonable starting point for building a web application. It's basically a beefed up webpack config with a bit of glue.

It's slightly biased in that it includes [react](http://facebook.github.io/react/), but that can be easily removed to work with any other reasonable web app framework or library.

I'm using [standard](https://github.com/feross/standard) for linting, but don't include it in any of the tasks, since it's usually done through [Sublime Text](https://github.com/feross/standard#editor-plugins). Stop bikeshedding, use standard. With that being said, it includes the eslint config file, so you can change rules and paint the bikeshed red.

You have four tasks or commands:

* `build` - Generate a production build
* `dev` - Start the development server
* `test` - Run all tests
* `test:unit:live` - Watch files and run tests whenever there are changes

Let's go over some of the features that it provides.

* Write modern (and future) JavaScript! Use ES6 (ES2015) and ES7 (ES2016?). This is achieved with [babel](https://babeljs.io/). If you don't know ES6, do yourself a favor and read [Exploring ES6](http://exploringjs.com/).

* [Source maps](http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/). Since you're writing modern/future JavaScript, it has to be transpiled so it'll work on current (and older) browsers. However, thanks to source maps you can still have debuggable code. You get source maps in all environments.

* Use [npm](https://www.npmjs.com/) to manage dependencies. If you have dependencies that do not use [UMD](https://github.com/umdjs/umd), you can customize the webpack config to work with essentially every module system out there.

* Asset bundling. A web application will typically include styles, images, fonts, and other miscellaneous files. These are not to be disregarded. Solutions through tools like gulp and grunt tend to do a poor job with these, and thus you end up having to keep a manifest of some sort. Your app's dependency graph should include all assets. This is all done thanks to [webpack](http://webpack.github.io/). Webpack is capable of handling pretty much any kind of dependency.

* It generates your app's entry point html file. This seems obvious, but it's something that is often overlooked.

* Covers three environments: development, testing, and production. It doesn't wave aside testing and generating production builds as a secondary concern.

* In development, it will watch your dependency graph for changes. It will do hot loading (i.e. updates without reloading the page) when possible and refresh otherwise. This allows you to iterate faster when working on your app.

* In the testing environment you have the choice to run tests once or to run tests whenever a file changes. This is done with [karma](https://karma-runner.github.io/0.12/index.html) as the test runner and [mocha](http://mochajs.org/) as the framework. Tests are run with [PhantomJS](http://phantomjs.org/), so you don't have to open a web browser. This allows you to write tests as you work on your application. Additionally, when tests run it will calculate your code coverage and generate a report.

* With production builds you get bundling, minification, and cache busting. Your app's dependencies will be copied to the output folder, and references are updated accordingly.

* The webpack config is heavily commented so you can know where to look once you need to start changing things, but provides reasonable defaults. It's responsible for setting up the bulk of the work.

* No gulp and no grunt, just npm run-scripts. Seriously, sometimes you don't need it.

## Closing notes

I tried to strike a balance between features and being generalized enough to be useful to multiple people. You can easily add other tools such as less or sass using [webpack loaders](http://webpack.github.io/docs/using-loaders.html).

Why webpack? Because it solves all the problems that I've had with web app development, and it just works. *Today*. There's other tools that are capable of solving a similar set of problems, but achieving the same end goal seems more difficult. I'd love to be proven wrong, though.

For a web app you'd probably have a separate API server, and if you're not planning on allowing CORS, you can setup proxying with [webpack-dev-server](http://webpack.github.io/docs/webpack-dev-server.html). Another option is to keep the public URL pointing to webpack-dev-server, but outputting the index.html to your server's public folder and having that server serve up files.

A friend forked and tweaked the repo to show an angular-friendly example. [Check it out](https://github.com/Foxandxss/angular-webpack-workflow), if angular is your thing.

I'm hopeful that this helps make your development experience a bit better. If you have any questions or suggestions, open up an [issue](https://github.com/cesarandreu/web-app/issues) on GitHub!
