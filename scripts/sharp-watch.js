import chokidar from 'chokidar'

import { inputDir, optimizeImage } from './_sharp.js'

await chokidar
  .watch(inputDir, { ignoreInitial: true })
  .on('all', async (event, path) => {
    if (event === 'add' || event === 'change') {
      await optimizeImage(path)
    }
  })
