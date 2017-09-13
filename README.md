# RevealJS Remote

Simple remote control for RevealJS presentations.

It makes you able to drive your presentations from your mobile phone very easily.

## Configuration

In order to be able to use it you need to configure your slides as follow:

```js
Reveal.initialize({
    /** various settings **/
    dependencies: [
        /** other modules **/
        { src: 'http://localhost:8080/socket.io/socket.io.js', async: true },
        { src: 'http://localhost:8080/html2canvas.min.js', async: true },
        { src: 'http://localhost:8080/listener.js', async: true },
    ]
});
```

## Run it!

Run the script `app.js` using `node`.

```bash
npm install #install required packages
npm start   #run app.js and open a server on port 8080
```

Open your phone browser on: [http://<computer_url>:8080/](http://<computer_url>:8080/), your remote is connected.

Open your presentation as before, it will log onto the app to get the controls sent by the remote.

## Available features

- arrows: swiping left, right, up or down will emulate arrows on presentation side
- lazer pointer: long click on the screen
- live snapshot of the presentation sent to the remote

