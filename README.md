# In browser embeddings

Wax poetic on what embeddings are and why you should care.

## Running the app

All you need to run this application is Node.js, a web browser, and Internet access. I'm using Node.js v18 but any current version should work just fine. It should work with any browser and was tested with Chrome, Firefox, Safari, and Brave. If it _doesn't_ work with a particular Internet provider, that'd be a surprise!

Clone this repo and from the root folder install all the dependencies:

```
$ npm install
```

Once installed, compile all the TypeScript:

```
$ npm run build

> in-browser-embeddings@1.0.0 build
> tsc && vite build

vite v6.1.1 building for production...
✓ 6 modules transformed.
dist/index.html                   1.35 kB │ gzip:   0.55 kB
dist/assets/index-DBUbJloy.css    2.34 kB │ gzip:   0.81 kB
dist/assets/index-vWqYdsvU.js   816.68 kB │ gzip: 217.57 kB
✓ built in 2.65s
```

With the TypeScript compiled, you can now preview the application:

```
$ npm run preview

> in-browser-embeddings@1.0.0 preview
> vite preview

  ➜  Local:   http://localhost:4173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

Now that it's running, go to the link vite provides you. Upload a pair of images—there are several in the [images](/images) folder for you to select from or just use some of your own—and click the compare button.

You should be presented with the _cosine similarity_ and _euclidean distance_ for the two images.

## Development

If you would like to modify the application, just launch it in dev mode:

```
$ npm run dev

> in-browser-embeddings@1.0.0 dev
> vite

12:50:10 PM [vite] (client) Re-optimizing dependencies because vite config has changed

  VITE v6.1.1  ready in 253 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

Now, when you make a change, the browser will automatically reload.

## What is this thing doing?
