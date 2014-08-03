# Form Validation with AngularJS and Rails

I've noticed that a lot of people seem to struggle with form validation. In my job at [Treasure-Data](http://www.treasuredata.com), I feel like we've found a great solution and felt obligated to share it.

Major props and credit goes to my coworker, Jake Becker, who was the one that initially implemented this. I simply ripped it out of our web console, added tests, and published it.

Although this blog post partly focuses on using a Rails backend, the angular directive and service can easily be used with any backend that implements validation errors in the same format. (Regardless of how validation errors are being done in the backend, one could most likely write a simple transformer to get the errors in the same format.)

## AngularJS

I've published [angular-server-form](https://github.com/cesarandreu/angular-server-form), which is a service along with a helper directive.

What does it do? It handles serializing your form model and submitting it to the server. When validation errors are received, it applies them back on the form model.

If you want to try it out locally, go to the repository and look under [examples](https://github.com/cesarandreu/angular-server-form#examples).

### Example

The simplest way to use angular-server-form is by using the `server-form` directive.

You could use it along with [ngMessages](https://docs.angularjs.org/api/ngMessages), but for my example I want to keep things simple.

**Controller:**

```javascript
$scope.model = {
  name: 'John Doe'
};
$scope.hasError = function hasError (model) {
  return model.$pristine && model.$error.server && model.$server;
};
```

**View:**

```html
<form server-form name="user" url="/users" method="POST">
  <label>
    Name: <input name="name" ng-model="model.name" />
  </label>
  <div style="color:red;" ng-show="hasError(user.name)" ng-bind='user.name.$server'></div>
  <button type="submit">Submit</button>
</form>
```

When you press submit, it will serialize the form and POST it to the `/users` url using $http.
The serialized form will look something like this:

```json
{
  "user": {
    "name": "John Doe"
  }
}
```

Let's pretend that this name is invalid because it is already taken. This is a validation that can only be done on the server.
Then we should receive a response with a `422` status code and a body that looks something like this:

```json
{
  "errors": {
    "user": {
      "name": ["\"John Doe\" is already taken"]
    }
  }
}
```

Upon receiving this, the form model gets updated and the error message is displayed under the name input. No need to write complicated error handling code.


### Directive vs Service

The directive is just a wrapper around the `serverForm` service. We've found that for most cases it provides the desired behavior, it's used in almost all of our forms. (Try it out in our [web console](https://console.treasuredata.com/)!)

If you need something more flexible you can create your own directive that makes use of the service, or use it directly from the controller. I've tried to do my best to document it, and I'm very open to constructive feedback on how to improve it.


## Rails

Tying angular-server-form in with Rails is so simple that I cannot imagine working on an AngularJS/Rails project and not using it.

In `application_controller.rb` you'll want to add a validation error rendering function:

```ruby
def render_validation_errors(model)
  render :json => { :errors => model.errors }, status: 422
end
```

You can use it in the model controller whenever something is being created or updated.

If we assume the frontend is the previous example, `user_controller.rb` would look like this:

```ruby
def create
  succeeded = @user.save
  unless succeeded
    render_validation_errors(@user)
  end
end
```

That's it! How simple was that? 


## Future work

I have yet to encounter a case where this format has proven to be inappropriate.
Frontend libraries could be written for other frameworks like Ember, or even as a jQuery plugin. Maybe it's already been done and I'm simply unaware of it, which wouldn't surprise me.

One idea I've had is that it'd be great to have an endpoint that looked at Active Record validations and generated a JSON response for validations that can be done on the client. It would provide a better user experience, and you wouldn't have to worry about updating validation in two places.

But there's no reason to limit it just to Rails! Any model layer could implement both validation errors and the client-side validations hash.
