# starfish-server

- **starfish** is a decentralized identity management and authentication system powered by Bitcoin. 
- **starfish-server** is an implementation of the Starfish identity scheme, which takes the form of a node.js web server.
- **[starfish-desktop](https://github.com/sobachef/starfish-desktop)**, a cross platform desktop app implementation (Mac, Windows, Linux) is powered by **starfish-server**. The desktop app wraps the starfish-server in an app format.

> To learn more about the Starfish identity scheme, check out the official documentation at: https://starfish.computer


# How starfish-server works

![workflow](workflow.png)

starfish-server is an implementation of the Starfish scheme that takes the form of a node.js module that runs as a web server at port `21000`.

The web server receives POST requests at its `/sign` endpoint and signs the request message with its embedded wallet and returns the HTTP response.

As of v0.1.0, the response format looks like this:

```
{
  "address": <The Signer Bitcoin Address>,
  "sig": <The Signature>,
  "message": <The message that was requested and signed>,
  "ts": <The unix timestamp at which the signature was made>
}
```

# Using the node module

Install the module in your project:

```
npm install --save starfish-server
```

And then start the server:

```
const starfish = require('starfish-server')
starfishd({
  db: <The Key Path for Starfish>
})
```

It will start a `/sign` endpoint at port `21000`.

If you make a POST request with a "message" attribute, it will sign the message and return the response.

```
<html>
<script>
fetch("http://localhost:21000/sign", {
  method: 'post',
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    message: "Sign this message!"
  })
}).then((res) => {
  return res.json()
}).then((res) => {
  console.log("Respons", res)
})
</script>
</html>
```

# Running as standalone

If you want to run starfish-server as a standalone app instead of a node module, you should first checkout the Starfish app, which wraps the `starfish-server` module in a cross platform app format that supports Mac, Windows, and Linux.

But if you must directly run `starfish-server` without running it as an app format, you can also do that. Just do:

```
npm install -g starfish-server
```

to install globally, and then run

```
starfish 
```
