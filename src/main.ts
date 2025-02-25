import './brand.css'
import './style.css'

import { pipeline } from '@huggingface/transformers'

const modelName = 'Xenova/clip-vit-base-patch32'
const imageFeatureExtractor = await pipeline('image-feature-extraction', modelName, { dtype: 'fp32' })

const leftImage = document.querySelector('#leftImage') as HTMLImageElement
const leftImageSelector = document.querySelector('#leftImageSelector') as HTMLInputElement
const rightImage = document.querySelector('#rightImage') as HTMLImageElement
const rightImageSelector = document.querySelector('#rightImageSelector') as HTMLInputElement
const compareButton = document.querySelector('#compareButton') as HTMLButtonElement
const cosineSimilaritySpan = document.querySelector('#cosineSimilarity') as HTMLDivElement
const euclideanDistanceSpan = document.querySelector('#euclideanDistance') as HTMLDivElement

compareButton.addEventListener('click', handleComparison)
leftImageSelector.addEventListener('change', handleImageSelection(leftImage))
rightImageSelector.addEventListener('change', handleImageSelection(rightImage))

async function handleComparison() {
  const leftImageEmbedding = await embedImage(leftImage.src)
  const rightImageEmbedding = await embedImage(rightImage.src)

  const similarity = cosineSimilarity(leftImageEmbedding, rightImageEmbedding)
  const euclidean = euclideanDistance(leftImageEmbedding, rightImageEmbedding)

  cosineSimilaritySpan.textContent = similarity.toString()
  euclideanDistanceSpan.textContent = euclidean.toString()
}

function handleImageSelection(image: HTMLImageElement) {
  return async function (event: Event) {
    const imageSelector = event.target as HTMLInputElement
    const arrayBuffer = await uploadImage(imageSelector)
    if (!arrayBuffer) return null
    displayImage(image, arrayBuffer)
  }
}

async function uploadImage(imageSelector: HTMLInputElement): Promise<ArrayBuffer | null> {
  const file = imageSelector.files?.[0]
  if (!file) return null

  const arrayBuffer = await file.arrayBuffer()
  return arrayBuffer
}

function displayImage(image: HTMLImageElement, arrayBuffer: ArrayBuffer) {
  const blob = new Blob([arrayBuffer])
  const url = URL.createObjectURL(blob)
  image.src = url
}

async function embedImage(url: string): Promise<Float32Array> {
  const tensor = await imageFeatureExtractor(url)
  return tensor.data as Float32Array
}

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

function euclideanDistance(a: Float32Array, b: Float32Array): number {
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
