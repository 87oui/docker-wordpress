import fs from 'node:fs'
import path from 'node:path'

import { inputDir, outputDir, getHash, optimizeImage } from './_sharp.js'

const optimizeImages = async (dir) => {
  if (!fs.existsSync(dir)) return

  await Promise.all(
    fs.readdirSync(dir, { recursive: true }).map(async (filePath) => {
      return await optimizeImage(path.join(dir, filePath))
    })
  ).then((results) => {
    const files = results
      .flat()
      .filter((v) => v)
      .map((outputPath) => {
        const imageBuffer = fs.readFileSync(outputPath)
        const hash = getHash(imageBuffer)

        return { outputPath, hash }
      })
    const manifest = {}
    for (const file of files) {
      const outputPath = file.outputPath.replace('theme/assets/', '')
      manifest[outputPath] = {
        file: outputPath + `?v=${file.hash}`,
      }
    }
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    fs.writeFile(
      path.join(outputDir, 'manifest.json'),
      JSON.stringify(manifest),
      (error) => {
        if (error) {
          console.error(error)
        }
      }
    )
  })
}

await optimizeImages(inputDir)
