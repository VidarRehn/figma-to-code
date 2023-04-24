import fs from 'fs-extra'
import prettier from 'prettier'

export const makePascalCase = (string) => {
  const separatedWords = string.split(" ");
  const pascalCase = separatedWords
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
  return pascalCase;
}

export const makeKebabCase = (string) => {
  const separatedWords = string.split("");
  const kebabCase = separatedWords
    .map(letter => {
      if (letter === " ") return "-"
      else return letter.toLowerCase()
    })
    .join("");
  return kebabCase;
}

export const getIdFromString = (string) => {
  const regex = /\((\d+:\d+)\)/
  const match = regex.exec(string)
  return match[1]
}

export const getNameFromString = (string) => {
  const regex = /^(.*?)\s*\(\d+:\d+\)$/
  const match = regex.exec(string)
  return match[1].trim()
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