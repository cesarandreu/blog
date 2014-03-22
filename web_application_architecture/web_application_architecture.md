# Web application architecture

I've spent some time thinking about how a web application should be architected. Basically, how should it look from a high level? How does the development cycle look? How does the deployment process look?

I read a lot about how applications should be modular, and I agree with this, but in practice I've come to realize I don't know how a large application should look. 

One of my coworkers says that you should try to visualize the perfect system, and aspire to build that perfect system, even if it's impossible in practice. When you know what the perfect system looks like, you can attempt to model your implementation as close as possible to that system.

The goal of this blog post is to try to write up some ideas, and receive feedback. I have a lot of questions related to how a modular web app should look. If you're knowledgeable about web application architecture you might want to skip to the part where it says __Making things smaller__.

## Known architectures

### Rails MVC

I believe Rails provides an easy to understand architecture. If you're starting off with web development, it seems like the clear choice to show you how MVC should look. It tells you how to structure everything, and it's has a lot of years of good practices behind it. 

With Rails you have one repository/folder, and your whole application is there in one place. You will request a page, and Rails will serve it up. 

The Rails approach is great for things like blogs or document oriented websites. You can get it up and running in a very small amount of time, and it'll be very well structured. I believe this works great for websites that have little to no javascript.

The big downside to Rails is that it appears to lead towards monolithic applications. It becomes harder and harder to reason about different parts of your application, and you may end up with complicated logic. Additionally, if you're attempting to make a web app, you probably won't be able to cache very much, and you'll find that the experience is not very good. Pages will take forever to load, and if they're JS-heavy, they'll end up loading even slower. 

It has multiple benefits, though. During development you simply run `RAILS_ENV=development bundle exec rails s`, and get working on it. During deployment, you can use a service like Heroku, which makes things completely painless. You can integrate it with a CI service to have your tests run, and then automagically have it deployed to Heroku with little to no configuration required. 

### Rails API + AngularJS 

This is still very similar to the previous approach, but Rails simply provides multiple JSON endpoints. AngularJS is a consumer of the JSON endpoints. It's what we use at [Treasure Data](wwww.treasuredata.com). This should be applicable to other front-end frameworks as well.

AngularJS will dynamically change pages and load content as required. The first benefit you'll notice from this is that it should be REALLY fast! You can start caching data on the client-side, so if they've previously visited a page you can show the cached data all while loading in new data that may have changed since their last visit.

With this approach you can provide a far better experience for your user. It can feel closer to an application and can provide improved interactions. 

The user's first page load will always take a reasonable amount of time, since it has to serve up the entire angularjs application. The way this is typically handled is by having the server respond with index.html to all requests that do not start with /api/ or /assets/. Once the application is loaded, the router can take over and begin fetching the data to display the appropriate page. When changing pages within the application it will fire off AJAX requests and dynamically change the view.

One downside is that your users will require javascript to use your web app at all. And the initial page-load could take a substantial amount of time, depending on the size of the application.

Development in this architecture will require starting up Rails in the background and then using something like Grunt or Gulp with a proxy to the Rails server and a static file server. So you can make all non /api/ requests respond with either the specific JS/CSS/whatever file or with the index.html file, which is the entry point for angular. For /api/ requests you just forward them to the rails server and return the response. Setting this up could take some time, thankfully there's a lot of scaffolds and examples online. I also wrote about this in my previous blog post. 

Deployment can get tricky. You'll want to build your AngularJS app and copy it to the /public/ folder of Rails (or you could deploy it with another static file server, that's also a possibility), and THEN you'll want to actually deploy the Rails app. With Heroku you can use buildpacks to achieve this without TOO much hassle. Building the angular app will also have its own set of complications and will require additional work in Grunt or Gulp.

One huge benefit of this architecture is that you can split up controllers to be much smaller, and if you chose to build a mobile app or a CLI interface, you already have API.

The problem with the Rails API + AngularJS solution is that it still suffers from having a monolithic Rails app. Even if you split out the angular app, your API is bundled in one place and it becomes hard to reason about different parts.

## Making things smaller

### Break everything apart

The idea I've started to consider is that your large application should probably just be a bunch of small applications that looks like a large application from an outsider's perspective. This seems like the ideal, but the more I think about this, the more questions I find. It seems like you can make it very easy to reason about specific parts of your application with this approach, but in exchange it complicates your deployment and development, and that seems to open up a can of worms. 

I recently learned of JWT, or [JSON Web Token](http://self-issued.info/docs/draft-ietf-oauth-json-web-token.html). And I believe if you use this approach for your authentication layer you can push towards building smaller applications. The idea is that you'll have an authentication server (or it could be part of your core API) which is responsible for giving users their token. Once a user has a token, they can hit any of the applications, and the application can very easily check the validity of the token before deciding what to do with the request.

This is where I'm still fuzzy on what the best approach might be. Some questions I've come up with:

Do you just build up lots of small applications where each just does one thing? This seems like could be hard to develop for and deploy. You'd have to keep track of interdependencies between the applications, and you'd probably end up having to repeat some model logic. You'd have to deploy applications atomically or through cascading dependencies. And when you're developing, do you just run those four or five different applications?

Do you just create a core API which contains hard dependencies, and then small applications to complement that API? If the small application requires some data from the core API, should it just hit its endpoints or should the user be expected to provide the required data?

Do you create fewer applications with modules that could be thought of as smaller applications? Or maybe more applications with modules shared across them?

Should all your applications use the same language? There's usually going to be certain languages/frameworks that beat out others in certain areas, and you'd probably want to take advantage of those. But then you'd be unable to share modules.

How should access control and permissions look? Should each application store its own permissions per resource, or should they all be in one place/server? If they're all in one place, do you just have the other applications hit the permissions server?  And if they're stored on the same server, do you just hit an endpoint to create/add/remove/modify permissions? If they're separated per application, doesn't that mean you end up developing different permission schemes? 

Related to the previous questions, what should your endpoints even look like? Do you create lots of simple endpoints and hit lots of them with your application during consumption, or do you try to combine them? For example, a page could change heavily depending on what permissions you have on a given resource, would you include that in the response for that resource of have a separate endpoint for the resources? What if there's too many resources to be loaded up all at once, would you then have the user check the endpoint every time along with something like the resource type and id? Another example, what if you have a page that multiple parts, some of which are really slow, do you break that off into another endpoint? That'd mean you could load different parts of the page faster.

How should routing look? Should each application get its own subdomain (app1.domain.com, app2.domain.com, etc)? Should they all be hidden a proxy, so all requests start going to the same domain and then get redirected (for example: /api/route1 routes to server1, /api/route2 to server2)? 

Would you deploy all of these applications on multiple servers? Would you join some in the same server, depending on size/complexity? How does deployment even look? Do you use something like Puppet or Chef? 

Do you use CI per project? How do you do something like E2E tests?

How will deployment look? How will development look for the consumer of these APIs, as well the APIs themselves?

Should it be one database per application? Should any applications share a database?

What about your front-end? Will it be deployed with a server that forwards all requests to the correct place, or do you hit the different servers directly? 

### Best approach

My current thoughts are that it seems like having a Core API, an authentication/permissions server, and functionality-specific applications that do one thing is the best approach. You don't have that many applications to worry about, but you still break off some parts. As long as you can keep dependencies mostly contained, deployment and development shouldn't be too complicated. 

## Closing thoughts

I don't know the answer to the questions above, so I'd be very curious to hear how people tackle these. Maybe there's a different approach I haven't even considered, in which case I'd love to hear about it! Please share your knowledge and experiences.
