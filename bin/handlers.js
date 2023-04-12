import * as prettier from 'prettier'
import fs from 'fs-extra'
import path from 'path'

import { makePascalCase } from './utils.js'
import { generateCss, cssTemplate } from './style-generation.js'
import { reactTemplate } from './react-generation.js'

const writeAndFormatFile = async (filepath, code, fileType) => {
    try {
      await fs.outputFile(filepath, code);
      const formattedCode = prettier.format(code, { parser: fileType });
      await fs.outputFile(filepath, formattedCode);
    } catch (error) {
      console.error(error);
    }
}

export const writeFiles = async (data, name) => {
    const componentName = makePascalCase(name)
  
    const jsonDir = './data';
    if (!fs.existsSync(jsonDir)) {fs.mkdirSync(jsonDir);}
    const componentsDir = `./src/components/${componentName}`
    if (!fs.existsSync(componentsDir)) {fs.mkdirSync(componentsDir, { recursive: true });}
  
    const jsonFilePath = path.join(jsonDir, `${componentName}.json`);
    const componentFilePath = path.join(componentsDir, `${componentName}.jsx`)
    const styleFilePath = path.join(componentsDir, `styles.module.css`)
  
    await writeAndFormatFile(jsonFilePath, JSON.stringify(data), 'json')
    await writeAndFormatFile(componentFilePath, reactTemplate(componentName), 'babel')
    const css = await generateCss(data)  
    await writeAndFormatFile(styleFilePath, cssTemplate(css), 'css')
  }