*README currently in work*

# Pre requirements
This app works with play 2.1-SNAPSHOT.
At the moment, you must checkout at this commit : a61a48e35a4c6c0e0d28966c84bcbbd0d4d4014a.

# PlayStory #

PlayStory is an app that receive logs over HTTP, persist them in MongoDB and display them in a Web page in real time.

## Back-end ##
This application use the last features of Play! Framework :

- ReactiveMongo driver <https://github.com/zenexity/ReactiveMongo>
- Play-ReactiveMongo <https://github.com/zenexity/Play-ReactiveMongo>
- New Json API
- Stream SSE/Comet (Enumerator/Enumeratee/Iteratee with Akka Actor)

## Font-end ##
PlayStory is a single-web page.    
All the javascript code rely on procrastination.js library (<https://github.com/jto/procrastination>).   
Here how I organize the javascript.

### Concepts ###
My application is composed of two pages :

- The home page.
- The dashboard page.
 
The idea is to split each page into several independant views.
We usually do a lot to manage a view :

- We make requests to the server.
- We listen some events from DOM, server (requests/streams) and javascript router.
- We update the DOM.

#### Navigation ####
My javascript Router have some interesting features:

```javascript
 Router.when('uri/:param', action1.then(action2))
```

```javascript
 Router.when('uri/:param').chain(action1, action2)
```

```javascript
 Router.when('uri/:param', action1.and(action2))
```

```javascript
 Router.when('uri/:param').par(action1, action2)
```

```javascript
Router.when('uri/:param').lazy(function() {
     return action1.then(action2);
});
```

```javascript
 Router.fromStart()
       .when('uri/:param')
       .chain(action1, action2)
```

```javascript
 Router.from('page')
       .when('uri/:param')
       .chain(action1, action2)
```

```javascript
 Router.go('page', true)
```

```javascript
 Router.forward()
```

```javascript
 Router.back()
```

#### Server ####

Binding to server events.

```javascript
 server.onReceive('uri/:param')
       .await(actions)
       .subscribe();
```

```javascript
 server.onReceiveFromTemplate('model')
       .await(actions)
       .subscribe();
```

#### DOM ####

Binding to DOM events:

```javascript
 When(event).await(actions).subscribe();
```

#### Bucket ####

'Bucket' is a just one place where you can put some models and collections.

##### Collection #####

```javascript
Bucket.collections('name').get()
```

```javascript
Bucket.collections('name').first()
```

```javascript
Bucket.collections('name').last()
```

```javascript
Bucket.collections('name').size()
```

```javascript
Bucket.collections('name').put(model)
```

```javascript
Bucket.collections('name').set(collection)
```

```javascript
Bucket.collections('name').reset()
```

```javascript
Bucket.collections('name').destroy()
```

##### Model #####

```javascript
Bucket.model('name').get()
```

```javascript
Bucket.model('name').set(model)
```
