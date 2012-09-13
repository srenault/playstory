*README currently in work*

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
 Router.when('feeds/:id', action1.then(action2))
```

```javascript
 Router.when('feeds/:id').chain(action1, action2)
```

```javascript
 Router.when('feeds/:id').par(action1, action2)
```

```javascript
Router.when('feeds/:id').lazy(function() {
     return action1.then(action);
});
```

```javascript
 Router.fromStart().when('feeds/:id').chain(action1, action2)
```

```javascript
 Router.from("home").when('feeds/:id').chain(action1, action2)
```

```javascript
 Router.go("dashboard, true)
```

```javascript
 Router.forward()
```

```javascript
 Router.back()
```

#### Server ####

```javascript
 server.onReceive('feeds/:id/coments').await(actions).subscribe();
```

```javascript
 server.onReceiveFromTemplate(model).await(PlayStory.Bucket.models(model).setAsAction).subscribe();
```

#### DOM ####

```javascript
 When(event).await(actions).subscribe();
```

#### Bucket ####

##### Collection #####

```javascript
Bucket.collections(name).get()
```

```javascript
Bucket.collections(name).first()
```

```javascript
Bucket.collections(name).last()
```

```javascript
Bucket.collections(name).size()
```

```javascript
Bucket.collections(name).put(model)
```

```javascript
Bucket.collections(name).set(collection)
```

```javascript
Bucket.collections(name).reset()
```

```javascript
Bucket.collections(name).destroy()
```

##### Model #####

```javascript
Bucket.model(name).get()
```

```javascript
Bucket.model(name).set()
```
