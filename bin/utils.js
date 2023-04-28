import fs from 'fs-extra'
import prettier from 'prettier'

// function to take name from Figma and return as pascal case (no spaces and caps on first words)
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

// example: return 23:45 from string "my component (23:45)"
export const getIdFromString = (string) => {
  const regex = /\((\d+:\d+)\)/
  const match = regex.exec(string)
  return match[1]
}

// example: return "my component" from string "my component (23:45)"
export const getNameFromString = (string) => {
  const regex = /^(.*?)\s*\(\d+:\d+\)$/
  const match = regex.exec(string)
  return match[1].trim()
}

// example: return "my component" from string "my component $div"
export const removeDollarSignSubString = (string) => {
  const regex = /\$[a-zA-Z]+\S*/
  const match = string.match(regex);
  return match ? string.replace(match[0], '').trim() : string
}

export const checkIfIdExists = (array, id) => {
  return array.some(obj => obj.id === id)
}

// function to check if directory exists and if not create it
export const createDirectory = async (directory) => {
  try {
    await fs.ensureDir(directory)
  } catch (err) {
    throw new Error(`Failed to create directory ${directory}: ${err.message}`)
  }
}

// function to write files into a specific filepath and then format them with prettier
export const writeAndFormatFile = async (filePath, content, fileType) => {
  try {
    await fs.outputFile(filePath, content);
    const formattedCode = prettier.format(content, { parser: fileType });
    await fs.outputFile(filePath, formattedCode);
  } catch (err) {
    throw new Error(`Failed to write file ${filePath}: ${err.message}`)
  }
}

// function to take a Figma file json and return any object where the name includes a specified string
export const checkIfComponentExistsInFile = (obj, string) => {
  let results = [];
  
  if (obj.name.includes(string)) {
    results.push(obj);
  }
  
  if (obj.children) {
    obj.children.forEach(child => {
      results = results.concat(checkIfComponentExistsInFile(child, string));
    });
  }
  
  return results;
}
