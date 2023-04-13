import fs from 'fs-extra'
import fetch from 'node-fetch';
import prettier from 'prettier'
import path from 'path'

import { generateCss, cssTemplate } from './style-generation.js'
import { reactTemplate } from './react-generation.js'

export const getFigmaFile = async (token, id) => {
  try {
    const response = await fetch(`https://api.figma.com/v1/files/${id}/`, {
        headers: {
            "X-Figma-Token": token
        }
    })
    const data = await response.json()
    return data.document.children[0].children
  } catch (error) {
    throw new Error(`Unable to get Figma file: ${error}`)
  }
}

export const makePascalCase = (string) => {
  const separatedWords = string.split(" ");
  const pascalCase = separatedWords
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
  return pascalCase;
}

export const createDirectory = async (directory) => {
  try {
    await fs.ensureDir(directory)
  } catch (err) {
    throw new Error(`Failed to create directory ${directory}: ${err.message}`)
  }
}

export const writeAndFormatFile = async (filePath, content, fileType) => {
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