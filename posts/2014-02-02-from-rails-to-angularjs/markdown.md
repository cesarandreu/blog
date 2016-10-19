# From Rails to AngularJS

## Introduction

At [Treasure Data](http://www.treasuredata.com) we were using Rails 3 for our web console. Initially, we would just add on jQuery to pages where we wanted improved functionality. Eventually, we started needing complicated functionality for some pages, and we decided to have an angular app per page. (**NOTE:** Not suggested.)

Unfortunately, our views were rendering _extremely_ slow, so each page load would take a very long time. For a while, I tried to optimize our views, by using [New Relic](https://github.com/newrelic/rpm) to find where they were going slowly. I gave up on this, as it wasn't yielding good results.

## Prototype

During one weekend, I decided to build a prototype of what I thought our web console should be. I ported over three pages to use AngularJS. It was hacky, and it didn't have the full functionality, but it was blazingly fast. My coworkers were impressed, so I got the go-ahead to push for a full port.

## Transitioning

Unfortunately, building a prototype is always the easy part. Doing the whole port has had a bunch of problems I did not take forsee. I put in a proposal outlining the goals and how to reach those goals on December 4'th, 2013. As of writing this, it's February 1'st, 2014, and we have still not managed to remove all of our Rails views.

Thankfully, we made this a progressive transition, which meant we could roll out changes progressively. The basic idea is that we'd convert one page at a time, and push it out to our customers. We weren't exactly perfect on this, and ended up taking a few weeks before we rolled anything out, but as of right now, we're at the point where we can move pages from Rails to AngularJS very easily.

The ultimate goal is to get Rails to just handle our API, and the angular app can handle the console experience; it also means removing all of our assets from Rails.

I'm going to share how our development workflow looks, some of the issues we encountered, and how we solved them.

## Development environment

I started out with [angular-generator](https://github.com/yeoman/generator-angular). I added on [CoffeeScript](http://coffeescript.org/) and [Jade](http://jade-lang.com/) support. You run `grunt serve` to start developing, it provides live reload and linting.

To get this to work, I had to add a [proxy](https://github.com/drewzboto/grunt-connect-proxy) which would forward requests to the local Rails server. However, it has the unfortunate side-effect that you can't hit Rails' HTML endpoints from the development environment, unless you explicitly added in a whitelist. It's a bit hacky, but it works.

While we're transitioning, we have our main Rails app, `td-api`, and inside it there's a `console` folder. In the console folder we have the AngularJS app, along with all of its configuration and tests. If you run `grunt build`, it builds the app in `td-api/console/dist`, cleans `td-api/public`, and moves all the compiled files. Then if you start Rails, you can interact with the website as it would be used in production.

I've added on a lot of functionality to our Gruntfile as things have been progressing. We compile all of our html files with [ngtemplates](https://github.com/ericclemmons/grunt-angular-templates), we have environment variables with [devcode](https://github.com/livedata/grunt-devcode), and we have automatic test running. Just to name a few.

Devcode is particularly useful, as it allows you to avoid having to load your user tracking code or chat code.

We're using [Bower](http://bower.io/) for our client-side dependencies, and it's great, except when it fails. As of writing this, Bower randomly fails, so it ends up breaking our CI and depoyment. To solve this, we were forced to include our `bower_components` folder into source control. Although I'm hopeful that we'll be able to remove this soon, as I've seen there's already some pull requests to fix these issues.

I have bower as a dependency in our `package.json`, and in the script's section we have a postinstall step which is just `"./node_modules/.bin/bower install"` so that when you run `npm install`, you also get the client-side dependencies installed.

## JSON endpoints

We're using [RABL](https://github.com/nesquena/rabl) to generate our JSON views, coupled with [yajl-ruby](https://github.com/brianmario/yajl-ruby). I ran a handful of tests and it appeared to be the fastest choice. (Although I'd love to be proven wrong, as I find RABL's syntax to be absolutely unintuitive.)

While doing this transition, some of our controllers ended up having large respond_to blocks due to changes in behavior between a JSON endpoint and an HTML endpoint. This is only temporary.

One good thing about going from HTML views to JSON views is that when you're just doing a 1:1 port of a page, you can include the same resources that the HTML view was using in your JSON view. Just doing a direct port of a page can be done very quickly. Then later you can decide to do changes to further improve the view or endpoint.

## Alternating between who handles the request

In order to allow Rails to serve our static html file, we created a constraint and moved in the resources for the pages we have already ported in our routes file. We also added a controller that just serves up our angular application.

`routes.rb`

```ruby
constraints(format: 'html') do
	resources :my_first_resource, :controller => 'static'
	resources :my_second_resource, :controller => 'static'
end

```

`static_controller.rb`

```ruby
class StaticController < ApplicationController
  before_filter :authenticate_user!
  layout false

  def index
    render file: 'public/static.html'
  end

  def method_missing(method_name)
    render file: 'public/static.html'
  end
end
```

If you're using [ngRoute](http://docs.angularjs.org/api/ngRoute) you need to set `target="_self"` on links that you do not want to be handled by angular. This will cause a new page load, and it will let Rails handle those requests. Otherwise, the angular router will attempt to handle the page change. However, you can make a [very simple directive](https://gist.github.com/cesarandreu/8762652) for that.

## User logins and registration

We're currently letting Rails handle this functionality. If you try to access any route before being authenticated it will send you to our login. After you login or register you're served the angular application. This lets us not have to worry about user validation on the angular app while we're working on porting views.

With that being said, we do have some interceptors for certain errors. For example, if you get a 401 error, you're taken to the login page.

## Validation Errors

My coworker took the lead on this. He created a directive which wraps ngForm, it takes all of the form's information (method, URL, onSuccess) and it transcludes allowing you to create your form however you want. For each input, he adds another directive for validation errors. Now, as long as your form's model matches the model on the server, on a failed submission all of the error messages are propagated and displayed below the fields.

On the server there's a helper function that looks like this:

```ruby
def render_validation_errors(model)
  render :json => { :errors => model.errors }, status: 422
end
```

An example from a controller looks like this:

```ruby
def create
  succeeded = @my_resource.save
  if succeeded
    render :json => { :my_resource => { :id => @my_resource.id, :name => @my_resource.name} }
  else
    render_validation_errors(@my_resource)
  end
end
```


## Unit Testing and E2E Testing

Unfortunately we haven't been very diligent with unit testing. We try to test functionality that we believe is important, but we'll usually end up cutting some corners with parts that we don't believe are as essential. Unit testing, in some cases, will just end up taking far too much time. It's a trade-off between speed and technical debt. If we had unlimited time and resources, I'd love to have fully tested components.

There's a watcher on unit tests, though! So when you do `grunt serve` it also watches your unit tests and runs them if any of them change.

Something we've been pushing very hard on are E2E tests. We're using [Protractor](https://github.com/angular/protractor/), it's quite awesome, and a big shoutout to [juliemr](https://github.com/juliemr) for her outstanding effort on it. Since I'm not experienced with how E2E tests should look or how the environment should be set up, I've sort of been putting things together as we've gone along.

We have a Rakefile that gives you a fresh environment to run your tests. It will drop the database if it exists, load the schema, and load the seeds. Additionally, it'll start up Rails.

`integration.rake`

```ruby
namespace :integration do
  desc "Prepares the integration tests"
  task :prepare do
    Rails.env = "integration"
    begin
      Rake::Task["db:drop"].invoke
    rescue Exception => e
      puts "The exception is #{e.message}"
    end
    Rake::Task["db:create"].invoke
    Rake::Task["db:schema:load"].invoke
    Rake::Task["db:seed"].invoke
  end

  task :run do
    begin
      sh "RAILS_ENV=integration bundle exec unicorn_rails -p 4000"
    rescue Exception => e
      puts "\n"
      sleep 1.5
    end
  end

end

task :integration => ["integration:prepare", "integration:run"]
```

`seeds.rb`

```ruby
case Rails.env
when "integration"
  puts "Loading integration seeds"
  load "#{Rails.root}/db/integration_seeds.rb"
  puts "Finished loading integration seeds"
else
  # Our other seeds are here
end
```

Inside `integration_seeds.rb` we create a few accounts and resources which would be impossible to create programmatically from our E2E tests.

These tests can ensure that at least the core functionality of our web console is present and that nothing is explicitly broken. Ultimately, I'd love to separate the tests into ones that can be run in a self contained way (that is, it programmatically generates all of the resources it needs to test certain functionality), and tests which require preparing the database with certain values beforehand.

I've set this up so that you can run `grunt devtest` and have it prepare the whole E2E testing environment, and watch the E2E tests for changes. The devtest command is heavily helped by (grunt-shell-spawn)[https://github.com/cri5ti/grunt-shell-spawn]. It'll run `rake integration:prepare`, and `./node_modules/protractor/bin/webdriver-manager update` synchronously; it'll start up Rails and Selenium with `rake integration:run` and `./node_modules/protractor/bin/webdriver-manager start` asynchronously. Then the task will run build so you have the latest version of the app in the public folder; it'll also run the watch task which executes [grunt-protractor-runner](https://github.com/teerapap/grunt-protractor-runner).

If you wish to take a similar approach with your E2E tests, our grunt.initconfig is setup like this:

```javascript
{
  watch: {
    e2eTest: {
      files: ['test/e2e/*/*_spec.js', 'test/e2e/*/*_spec.coffee'],
      task: ['protractor:live'],
      options: {
        spawn: false
      }
    },
    // Other watch tasks
  }
}
```
```javascript
{
  protractor: {
    live: {
      options: {
        configFile: 'protractor.live.conf.js',
        args: {
        }
      }
    },
    // Other protractor tasks
  }
}
```

After your grunt.initconfig you also need to set it up so that the file (or files) that get changed are the ones run.

```javascript
  var changedFiles = {};
  var onChange = grunt.util._.debounce(function() {
    grunt.config('protractor.live.options.args.specs', Object.keys(changedFiles));
    grunt.task.run('protractor:live');
    changedFiles = {};
  }, 200);
  grunt.event.on('watch', function (action, filepath, taskName) {
    if (taskName === 'e2eTest') {
      changedFiles[filepath] = action;
      onChange();
    }
  });
```

## Continuous Integration


With [CircleCI](https://circleci.com) you have to define a file with all of your configuration. Since our Rails app and Angular app are in the same folder, our setup is a bit complicated.

When you push to our repo, it gets picked up by CircleCI. First it installs Rails and Node's dependencies, updates webdriver and build the app. Then it'll prepare the integration environment's database. It runs all the rspec tests automatically, afterwards it'll start Rails in the integration environment, start webdriver, run the unit tests, and run the E2E tests.

Below you can see an example of how this looks, although I've ommited some parts that aren't relevant.

`circle.yml`

```yaml
dependencies:
  cache_directories:
    - "console/node_modules"
  post:
    - npm install:
        pwd: console
    - bundle exec grunt prepareci:
        pwd: console
        environment:
          BUNDLE_GEMFILE: ../Gemfile

database:
	post:
		- bundle exec rake integration:prepare

test:
  post:
    - nohup bash -c "bundle exec unicorn_rails -p 4000 &":
        environment:
          RAILS_ENV: integration
    - bundle exec grunt testci:
        pwd: console
        timeout: 600
        environment:
          BUNDLE_GEMFILE: ../Gemfile

deployment:
  staging:
    branch: master
    heroku:
      appname: staging
  production:
    branch: production
    heroku:
      appname: production
```

**NOTE:** We have to run some commands with `bundle exec` because we're using Compass for our stylesheets, and we install this as part of Rails' dependencies.

## Deployment

We use Heroku. Deploying required changing the buildpack. Originally we just used the default Ruby buildpack. But since we don't want to commit our public folder to source control, we're using [heroku-buildpack-multi](https://github.com/ddollar/heroku-buildpack-multi). As the name implies, it allows you to have multiple buildpacks.

I forked a fork of the Heroku Node buildpack and made some parts configurable, [you can it find here](https://github.com/treasure-data/heroku-buildpack-nodejs-grunt-compass-configurable/). It allows you to add a config file to specify what directory your package.json is located in, what npm command to execute, and what grunt command to execute.

`.heroku_config`

```sh
export NODE_WORKING_DIRECTORY='/console'
export NPM_COMMAND='npm install'
export GRUNT_COMMAND='grunt build'
```

After the Node buildpack is run, it runs the Ruby buildpack to run Rails.

## Conclusion

Hopefully this can help out future developers that want to transition from Rails views to AngularJS. I'd love feedback, and I'd be more than glad to help anyone out if they're having issues or they're trying something similar.

We've also done some neat tricks with our model layer to make page changes appear faster. I'm hoping I can clean up that code and put it out there for others to use; I'll probably be writing another blog about our models.

Overall, the change has been very positive, the console feels much faster and responsive, and now that we have such a smarter client we can make the application far more interactive.
