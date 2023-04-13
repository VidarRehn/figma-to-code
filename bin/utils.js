import fs from 'fs-extra'
import prettier from 'prettier'

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