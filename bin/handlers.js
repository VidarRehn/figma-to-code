import prettier from 'prettier'
import fs from 'fs-extra'
import path from 'path'

import { makePascalCase, createDirectory } from './utils.js'
import { generateCss, cssTemplate } from './style-generation.js'
import { reactTemplate } from './react-generation.js'

const writeAndFormatFile = async (filePath, content, fileType) => {
    try {
      await fs.outputFile(filePath, content);
      const formattedCode = prettier.format(content, { parser: fileType });
      await fs.outputFile(filePath, formattedCode);
    } catch (err) {
      throw new Error(`Failed to write file ${filePath}: ${err.message}`)
    }
}

export const generateFiles = async (data, name) => {
    const componentName = makePascalCase(name)
  
    const jsonDir = './data';
    await createDirectory(jsonDir)

    const componentDir = `./src/components/${componentName}`
    await createDirectory(componentDir)
  
    const jsonFilePath = path.join(jsonDir, `${componentName}.json`);
    const componentFilePath = path.join(componentDir, `${componentName}.jsx`)
    const styleFilePath = path.join(componentDir, `styles.module.css`)
  
    await writeAndFormatFile(jsonFilePath, JSON.stringify(data), 'json')
    await writeAndFormatFile(componentFilePath, reactTemplate(componentName), 'babel')

    const css = await generateCss(data)  
    await writeAndFormatFile(styleFilePath, cssTemplate(css), 'css')
}