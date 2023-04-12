import fetch from "node-fetch"
import * as dotenv from 'dotenv'
import * as prettier from 'prettier'
import fs from 'fs-extra'

dotenv.config()

export const getExpirationTimestamp = async (expiry) => {
    const today = new Date()
    const currentTime = today.getTime()
    const expirationTime = currentTime + (expiry * 1000)
    return expirationTime
}

export const isTokenActive = (expiry) => {
    const today = new Date()
    const currentTime = today.getTime()
    if (expiry > currentTime){
        return true
    } else {
        return false
    }
}

export const makePascalCase = (string) => {
  const separatedWords = string.split(" ");
  const pascalCase = separatedWords
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
  return pascalCase;
}

export const getOAuthToken = async (code) => {
  try {
    let response = await fetch('https://www.figma.com/api/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_id: process.env.CLIENT_ID,
          client_secret: process.env.CLIENT_SECRET,
          redirect_uri: process.env.REDIRECT_URI,
          code: code,
          grant_type: 'authorization_code'
        })
      })
    let data = response.json()
    return data
  } catch (err) {
    console.log(err)
  }
}

export const getDocumentFrames = async (id, token) => {
  try {
    const response = await fetch(`https://api.figma.com/v1/files/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    const data = await response.json()
    return data.document.children[0].children
  } catch (err) {
    console.log(err)
  }
}

const getFlex = async (json) => {
  let cssString = ''

  //perhaps make below switch statement

  if (json.layoutMode){
      cssString += 'display: flex;'
      if (json.layoutMode === 'HORIZONTAL'){
          cssString += 'flex-direction: row;'
          if (json.primaryAxisAlignItems){
              if (json.primaryAxisAlignItems === 'CENTER'){
                  cssString += 'justify-content: center;'
              } else if (json.primaryAxisAlignItems === 'MAX'){
                  cssString += 'justify-content: flex-end;'
              } else if (json.primaryAxisAlignItems === 'SPACE_BETWEEN'){
                  cssString += 'justify-content: space-between;'
              } else {
                  cssString += 'justify-content: flex-start;'
              }
          }
          if (json.counterAxisAlignItems){
              if (json.counterAxisAlignItems === 'CENTER'){
                  cssString += 'align-items: center;'
              } else if (json.counterAxisAlignItems === 'MAX'){
                  cssString += 'align-items: flex-end;'
              } else if (json.counterAxisAlignItems === 'SPACE_BETWEEN'){
                  cssString += 'align-items: space-between;'
              } else {
                  cssString += 'align-items: flex-start;'
              }
          }
      } else if (json.layoutMode === 'VERTICAL'){
          cssString += 'flex-direction: column;'
      }
      if (json.itemSpacing){
          cssString += `gap: ${json.itemSpacing}px;`
      }
  }

  return cssString
}

const getBoxModel = async (json) => {
  let cssString = ''

  // behövs ev en func för att ge shorthand padding

  if (json.paddingLeft){cssString += `padding-left: ${json.paddingLeft}px;`}
  if (json.paddingRight){cssString += `padding-right: ${json.paddingRight}px;`} 
  if (json.paddingTop){cssString += `padding-top: ${json.paddingTop}px;`} 
  if (json.paddingBottom){cssString += `padding-bottom: ${json.paddingBottom}px;`}

  return cssString
}

const getColor = async (json) => {
  let cssString = ''
  if (json.backgroundColor){
      let {r, g, b, a} = json.backgroundColor
      r = Math.round(r * 255)
      g = Math.round(g * 255)
      b = Math.round(b * 255)
      cssString += `background-color: rgba(${r}, ${g}, ${b}, ${a});`
  }
  return cssString
}

export const generateCss = async (json) => {
  let cssString = ''
  cssString += await getFlex(json)
  cssString += await getBoxModel(json)
  cssString += await getColor(json)

  return cssString
}

export const writeAndFormatFile = async (filepath, code, fileType) => {
  try {
    await fs.outputFile(filepath, code);
    const formattedCode = prettier.format(code, { parser: fileType });
    await fs.outputFile(filepath, formattedCode);
    console.log(`file created successfully!`);
  } catch (error) {
    console.error(error);
  }
}