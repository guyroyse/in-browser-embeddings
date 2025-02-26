# In browser embeddings

Embeddings are merely arrays of numbers that contain semantic information about unstructured data like text or images. The more similar the values in the arrays, the more similar the unstructured data. These arrays, called vectors, can be compared using surprisingly simple algorithms.

Embeddings are generated using AI models and, like most things AI, from Python and on a server. But this doesn't _have_ to be the case. You can do it in a browser and with JavaScript if you use [Transformers.js](https://huggingface.co/docs/transformers.js/index). This repository and accompanying README will show you how.

![Screenshot of the app comparing images of two fires](/screenshot.png)

## Running the app

All you need to run this application is Node.js, a web browser, and Internet access. I'm using Node.js v18 but any current version should work just fine. It should work with any browser and was tested with Chrome, Firefox, Safari, and Brave. If it _doesn't_ work with a particular Internet provider, that'd be a surprise!

Clone this repo and, from the root folder, install all the dependencies:

```bash
$ npm install
```

Once installed, compile all the TypeScript:

```bash
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

With the TypeScript compiled, you can now run the application:

```bash
$ npm run preview

> in-browser-embeddings@1.0.0 preview
> vite preview

  ➜  Local:   http://localhost:4173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

Now that it's running, go to the link [vite](https://vite.dev/) provides you. Upload a pair of images—there are several in the [images](/images) folder for you to select from or just use some of your own—and click the compare button.

You should be presented with the _cosine similarity_ and _Euclidean distance_ for the two images.

## What do these numbers mean?

Think of vectors as coordinates in a multi-dimensional space. If a pair of vectors consists of three values, they represent a point in a 3-dimension space. If there are 512 values, then there are 512-dimensions.

_Cosine similarity_ and _Euclidean distance_ are common techniques to measure how close these points are to each other.

**Cosine similarity** is the cosine of the angle between the two points represented by the vectors. It is always a value between -1.0 and 1.0 and the larger the cosine similarity, the more similar the vectors are. A result of 1.0 means that the points are in line with each other and -1.0 means that are in opposite directions to each other.

**Euclidean distance** is the straight-line distance between the points represented by the vectors. It is either 0 or a positive number. The smaller the number, the shorter the distance between the points, and thus the more similar the vectors.

## How it works

So how does this thing work? Well, there's a fair bit of code that uploads images, makes buttons work, and mundane stuff like that. We're not gonna cover those bits at all. You're a developer and I'm assuming you can figure that out yourself. What we are gonna focus on are the cool bits that create and compare the embeddings.

Feel free to load up the code and take a look—it's all in [main.ts](/src/main.ts). I've pulled out the bits that load the AI model, create the embeddings, and use them so I can explain them below.

### Loading the model

You have to load a model to use it. This code brings in the Transformers.js library and does just that—loading a model that can extract features from images. I've gone with the [Xenova/clip-vit-base-patch32](https://huggingface.co/Xenova/clip-vit-base-patch32) model and instructed it to perform _image feature extraction_. In this context, features are just the semantic information contained in the image.

Note that you don't need to download the model yourself, Transformers.js will download it from Huggingface as part of the call to `pipeline`. Also note that I've provided the expected datatype which is `fp32` or a 32-bit float.

```typescript
import { pipeline } from '@huggingface/transformers'

const modelName = 'Xenova/clip-vit-base-patch32'
const imageFeatureExtractor = await pipeline('image-feature-extraction', modelName, { dtype: 'fp32' })
```

### Creating an embedding

Now, let's create the embedding.

The function below uses the `imageFeatureExtractor` created above to, well, extract the features from the image. The image is provided as a URL. In our case, we're using a [data URL](https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Schemes/data), but this could be any URL that points to an image.

The `imageFeatureExtractor` returns a [`Tensor`](https://huggingface.co/docs/transformers.js/api/utils/tensor) which contains the embedding and its metadata. We just want the data, and we know it's a [`Float32Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array), so we cast it accordingly. This array _is_ the embedding.

```typescript
async function embedImage(url: string): Promise<Float32Array> {
  const tensor = await imageFeatureExtractor(url)
  return tensor.data as Float32Array
}
```

You can see that there's really not a lot of code and we've already got our embedding. Nifty!

### Using the vectors

Typically, you would take an embedding and store it in a [vector database](https://redis.io/redis-for-ai/) or use it to do some sort of vector search. This is good and proper and you should totally do this.

However, we're going to compare two vectors right in the browser. I've written a function to compute the _cosine similarity_ and the _Euclidean distance_ for a pair of vectors. Okay. I had Copilot handle it, but hey—it works!

```typescript
function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  let dot = 0.0
  let normA = 0.0
  let normB = 0.0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  const similarity = dot / (Math.sqrt(normA) * Math.sqrt(normB))

  return roundNumber(similarity)
}

function EuclideanDistance(a: Float32Array, b: Float32Array): number {
  let sum = 0.0
  for (let i = 0; i < a.length; i++) {
    sum += Math.pow(a[i] - b[i], 2)
  }

  const distance = Math.sqrt(sum)

  return roundNumber(distance)
}

function roundNumber(num: number): number {
  return Math.round(num * 1000) / 1000
}
```

The point here isn't to do a deep dive into these algorithms but to show that they're not that complicated. And that any developer can compare vectors in their code with ease.

The rest of the app is just calling these various functions and putting stuff on the screen. In total, the TypeScript for this project is under 100 lines and most of it is plumbing. Not bad.

## Putting it all to use

This app and its code is intended to be instructional. In practice, you'll generate an embedding in a browser and then hand it off to something server-side (and probably Python) that implements things like [semantic search](https://redis.io/docs/latest/develop/get-started/vector-database/) or [retrieval-augmented generation](https://redis.io/docs/latest/develop/get-started/rag/).

Creating embeddings is just the first step in building AI-powered applications. And the browser is a great place to do that!
