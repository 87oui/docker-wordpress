import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

import sharp from 'sharp'

export const inputDir = 'src/images'
export const outputDir = 'theme/assets/images'

const hash =
  crypto.hash ??
  ((algorithm, data, outputEncoding) =>
    crypto.createHash(algorithm).update(data).digest(outputEncoding))

export const getHash = (content, length = 8) => {
  const h = hash('sha256', content, 'hex').substring(0, length)
  if (length <= 64) return h

  return h.padEnd(length, '_')
}

export const exportImage = async (obj, outputPath) => {
  if (!obj || !outputPath) return

  let ok = false
  await obj
    .toFile(outputPath)
    .then((info) => {
      console.log(`${outputPath} ${info.size / 1000}KB`)
      ok = true
    })
    .catch((error) => console.error(error))

  return ok && outputPath
}

export const optimizeImage = async (inputPath) => {
  const fileext = path.extname(inputPath)
  if (!/.(jpg|png|svg|webp)$/.test(fileext)) return

  const filename = path.basename(inputPath)
  const outputPath = inputPath.replace(inputDir, outputDir)
  const needsResize = path
    .basename(filename, path.extname(filename))
    .endsWith('@2x')

  const outputImageDir = path.dirname(outputPath)
  if (!fs.existsSync(outputImageDir)) {
    fs.mkdirSync(outputImageDir, { recursive: true }, (error) => {
      if (error) console.error(error)
    })
  }

  const outputPaths = []
  if (fileext === '.jpg' || fileext === '.png') {
    const defaultFormat = sharp(inputPath)
    const webpFormat = sharp(inputPath)

    const { width, height } = await defaultFormat.metadata()
    let defaultFormatHalf
    let webpFormatHalf
    if (needsResize) {
      let halfWidth = width / 2
      if (!Number.isInteger(halfWidth)) {
        console.warn(`${inputPath}: widthが整数ではありません`)
        halfWidth = Math.floor(halfWidth)
      }
      let halfHeight = height / 2
      if (!Number.isInteger(halfHeight)) {
        console.warn(`${inputPath}: heightが整数ではありません`)
        halfHeight = Math.floor(halfHeight)
      }
      defaultFormatHalf =
        needsResize && sharp(inputPath).resize(halfWidth, halfHeight)
      webpFormatHalf =
        needsResize && sharp(inputPath).resize(halfWidth, halfHeight)
    }

    webpFormat.webp({ quality: 50 })
    if (webpFormatHalf) webpFormatHalf.webp({ quality: 50 })

    if (fileext === '.jpg') {
      defaultFormat.jpeg({ quality: 70 })
      if (defaultFormatHalf) defaultFormatHalf.jpeg({ quality: 70 })
    } else if (fileext === '.png') {
      defaultFormat.png({ quality: 70 })
      if (defaultFormatHalf) defaultFormatHalf.png({ quality: 70 })
    }

    outputPaths.push(await exportImage(defaultFormat, outputPath))
    outputPaths.push(await exportImage(webpFormat, outputPath + '.webp'))
    if (defaultFormatHalf) {
      outputPaths.push(
        await exportImage(defaultFormatHalf, outputPath.replace('@2x', ''))
      )
    }
    if (webpFormatHalf) {
      outputPaths.push(
        await exportImage(
          webpFormatHalf,
          outputPath.replace('@2x', '') + '.webp'
        )
      )
    }
  } else {
    fs.copyFile(inputPath, outputPath, (error) => {
      if (error) {
        console.error(error)

        return
      }
      outputPaths.push(outputPath)
    })
  }

  return outputPaths
}
