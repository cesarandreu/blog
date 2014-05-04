# Handling User States in AngularJS

I hang out in the #angularjs IRC channel and I see people semi-regularly bring up the topic of how to handle logged in users. My goal is to demystify this, and give people a sane pattern to copy, follow, or modify.


## Problems

* You have a login gated AngularJS application that needs to access the user model in multiple places, such as different services or controllers.
* You want to configure certain services based on the user's state.
* You want to access control certain routes or states. 
* You haven't done anything like this before and you're feeling lost. 

How should you handle these? How do you handle different access levels? How do you handle transitioning between being logged in and logged out? 


## Solution

For starters, I suggest using [ui-router](https://github.com/angular-ui/ui-router). This solution is based on ui-router and assumes you're familiar with how it works. If you're not familiar with it, I'd suggest taking a look at [these wonderful slides](http://slides.com/timkindberg/ui-router). 


### Code

Here's the code. It's a full example, and is explained below. It goes inside a configuration block:

```
$stateProvider

.state('loggedOut', {
  template: '<ui-view />',
  abstract: true,
  onEnter: ['$rootScope', '$angularCacheFactory', function ($rootScope, $angularCacheFactory) {
    $angularCacheFactory.clearAll();
    $rootScope.$emit('loggedOut');
  }]
})

.state('loggedIn', {
  template: '<ui-view />',
  abstract: true,
  resolve: {
    currentUser: ['usersService', function (usersService) {
      return usersService.current.routeGet();
    }]
  },
  onEnter: ['$rootScope', 'currentUser', function ($rootScope, currentUser) {
    $rootScope.$emit('loggedIn', currentUser);
  }]
})

.state('outsideLayout', {
  templateUrl: '/views/layout/outsideLayout.html',
  abstract: true,
  parent: 'loggedOut'
})    

.state('layout', {
  templateUrl: '/views/layout/layout.html',
  controller: 'LayoutCtrl',
  abstract: true,
  parent: 'loggedIn'
})

.state('login', {
  url: '/login',
  templateUrl: '/views/users/signin.html',
  controller: 'SignInCtrl',
  parent: 'outsideLayout'
})

.state('resources', {
  url: '/resources',
  templateUrl: '/views/resources/index.html',
  controller: 'ResourcesIndexCtrl',
  parent: 'layout',
  resolve: {
    resources: ['resourcesService', function (resourcesService) {
      return resourcesService.index.routeGet();
    }]
  }
});

$httpProvider.responseInterceptors
.push(['$q', '$injector', 'growl', function ($q, $injector, growl) {
  return function (promise) {
    return promise.then(function (response) {
      return response;
    }, function (response) {
      if (response.status === 401) {
        growl.addErrorMessage('You must be logged in to access this page.');
        $injector.get('$state').go('login');
      } else if (response.status === 403) {
        growl.addErrorMessage('You do not have permissions to access this resource.');
        $injector.get('$state').go('resources');
      } else if (response.status === 404) {
        growl.addErrorMessage('Resource not found.');
      }

      return $q.reject(response);
    });
  };
}]);

```


### loggedIn / loggedOut States

The basic idea is that you'll have two abstract parent states: __loggedIn__ and __loggedOut__, with every state being a child of one of those two.

#### loggedIn

The __loggedIn__ state is the top-level state that is used when it's known a user is logged in.

It has a resolves object with `currentUser`. (__Note:__ `usersService` is a model service that I built, it's used mostly to provide caching.)

Once the `currentUser` promise in the resolves object is resolved, it'll trigger the `onEnter` function that in turn will emit the `loggedIn` event with the current user. This is useful if you have analytics libraries that you wish to configure with the user's data, or if you need to setup anything that depends on the user. 

Thanks to the resolve you can inject `currentUser` into any child state's controller. For example: in `LayoutCtrl` you might want to set the user's name on the navbar, or change the navigation buttons available to them based on certain attributes. While in `ResourcesIndexCtrl` you might want to change certain behavior based on their permissions. 

#### loggedOut

The __loggedOut__ state is the top-level state that is used when a user is logged out.

It has an `onEnter` function which handles cleaning up the user's cache if they visit any non-login-gated state. It's primarily used for when the user is logging out; to make sure that no data stays in their cache. 
It'll also emit a `loggedOut` event. You can listen for this event to reset your analytics libraries to clean state, or to clean certain services. 

#### Events

I do not advise heavy usage of events, as it can lead to complicated and hard to test code. The `loggedIn` and `loggedOut` events are relevant to the application's global state, so it seems appropriate to emit them on the root scope.


## HTTP Interceptor

For the `loggedIn` and `loggedOut` states to work well, you'll need to add an [HTTP Interceptor](https://docs.angularjs.org/api/ng/service/$http#interceptors).

If they receive a 401 status in a request's response it means the user attempted to access a state that requires being logged in, but they're not logged in, so they must be sent to the login page. For example: visiting `/resources` without being logged in will cause them to be redirected to `/login`.

If they receive a 403 status it means they tried to access a resource for which they do not have permissions, and should be taken to the main resource page.

(__Note:__ [growl](https://github.com/marcorinck/angular-growl) is a small library for showing users notifications.)


### Bonus: Access Control

I don't put much work into access control, since all the code is sent directly to the user on their first page-load, they can modify their model manually and gain access to pages that they shouldn't. You should __always__ handle access control on the server.

If you have an application-wide admin page for managing _all_ users, I would advise hosting this as a separate application and not including it in the regular user's application.

For improving the user's experience, I made a `permissionsService` which listens on the `loggedIn` event to set some keys on an object based on what actions a user can perform or what pages they can access. (It'll also listen to the `loggedOut` event to reset itself.) This is what I'll normally check when deciding to hide or show certain parts of the application layout. Another idea I've seen is having a separate endpoint _just_ for the user's permissions, which you could include in the `loggedIn` state's resolve object.

For restricted states you can add a data object. In this data object, you can set a rule with a string as the value. Listen for the `$stateChangeStart` event and check if the next state has a rule. If it does, check if the user has the rule (using either `currentUser` or some permissions object). If they don't have the rule, they should be redirected elsewhere; I have a catchall to send them to the main page. If they have the rule, the state will change as it normally would.

## Closing thoughts

As always, take it with a grain of salt. It might not be applicable to your specific use-case, or you might have a different (maybe even better!) solution that I haven't even considered. 

Do you take a different approach, think this approach is broken, or that it's straight up wrong? I'd love to hear your thoughts. Leave a comment or shoot me an email.

If you have any questions feel free to ask in a comment or [join us in IRC](irc://irc.freenode.net/angularjs)!

