import fs from 'fs-extra'

export const getExpirationTimestamp = (expiry) => {
  const today = new Date()
  const currentTime = today.getTime()
  return currentTime + (expiry * 1000)
}

export const isTokenActive = (expiry) => {
  const today = new Date()
  const currentTime = today.getTime()
  return expiry > currentTime
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