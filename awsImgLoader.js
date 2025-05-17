'use client'

export default function AWSLoader({ src, width, quality }) {
  return `https://spraby.s3.eu-north-1.amazonaws.com/${src}?w=${width}&q=${quality || 75}`
}
