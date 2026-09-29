import fs from 'node:fs'
import path from 'node:path'

const source = path.resolve('src/renderer')
const destination = path.resolve('dist/renderer')

const assetsSource = path.resolve('src/assets')
const assetsDestination = path.resolve('dist/assets')
const legalSource = path.resolve('docs/legal')
const legalDestination = path.join(destination, 'legal')

fs.mkdirSync(destination, { recursive: true })
fs.mkdirSync(assetsDestination, { recursive: true })
fs.mkdirSync(legalDestination, { recursive: true })

for (const file of ['index.html', 'controller.js']) {
    fs.copyFileSync(
        path.join(source, file),
        path.join(destination, file)
    )
}

for (const file of ['privacy.md', 'terms.md']) {
    fs.copyFileSync(
        path.join(legalSource, file),
        path.join(legalDestination, file)
    )
}

fs.cpSync(assetsSource, assetsDestination, { 
    recursive: true
})