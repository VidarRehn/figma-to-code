
import { makePascalCase, removeDollarSignSubString } from "./utils.js"

// function to return a css code-string
export const cssTemplate = (content, name) => {
    return (`
    .${name} {
        ${content}
    }
    `)
}

// function to return css flex variables if auto layout activated in Figma
const getFlex = async (json) => {
    let cssString = ''
    const {layoutMode, primaryAxisAlignItems, counterAxisAlignItems, itemSpacing} = json

    //perhaps make below switch statement
  
    if (layoutMode){
        cssString += 'display: flex;'
        if (layoutMode === 'HORIZONTAL'){
            cssString += 'flex-direction: row;'
        } else if (layoutMode === 'VERTICAL'){
            cssString += 'flex-direction: column;'
        }
        if (primaryAxisAlignItems){
            if (primaryAxisAlignItems === 'CENTER'){
                cssString += 'justify-content: center;'
            } else if (primaryAxisAlignItems === 'MAX'){
                cssString += 'justify-content: flex-end;'
            } else if (primaryAxisAlignItems === 'SPACE_BETWEEN'){
                cssString += 'justify-content: space-between;'
            } else {
                cssString += 'justify-content: flex-start;'
            }
        }
        if (counterAxisAlignItems){
            if (counterAxisAlignItems === 'CENTER'){
                cssString += 'align-items: center;'
            } else if (counterAxisAlignItems === 'MAX'){
                cssString += 'align-items: flex-end;'
            } else if (counterAxisAlignItems === 'SPACE_BETWEEN'){
                cssString += 'align-items: space-between;'
            } else {
                cssString += 'align-items: flex-start;'
            }
        }
        if (itemSpacing){
            cssString += `gap: ${itemSpacing}px;`
        }
    }
  
    return cssString
}

// function to return a color string from a json-object
const getRGBA = (colorObject) => {
    let {r, g, b, a} = colorObject
    r = Math.round(r * 255)
    g = Math.round(g * 255)
    b = Math.round(b * 255)
    return `rgba(${r}, ${g}, ${b}, ${a})`
}

// function to return font size from json
const getFont = async (json) => {
    let cssString = ''
    if (json.style?.fontSize){
        cssString += `font-size: ${json.style.fontSize}px;`
    }
    return cssString
}

// function to check if border exists
const getBorder = async (json) => {
    let cssString = ''
    if (json.cornerRadius){cssString += `border-radius: ${json.cornerRadius}px;`}
    // här borde det kollas om border verkligen ska vara densamma på alla sidor
    if (json.strokes.length > 0 ){
        const stroke = json.strokes[0]
        cssString += `border: ${json.strokeWeight}px ${stroke.type} ${getRGBA(stroke.color)};`
    }
    return cssString
}
  
// function to get element padding
const getPadding = async (json) => {
    let cssString = ''
    const {paddingTop, paddingRight, paddingBottom, paddingLeft} = json
    if (paddingTop !== undefined || paddingRight !== undefined || paddingBottom !== undefined || paddingLeft !== undefined){
        cssString += `padding: ${paddingTop !== undefined ? paddingTop : 0}px ${paddingRight !== undefined ? paddingRight : 0}px ${paddingBottom !== undefined ? paddingBottom : 0}px ${paddingLeft !== undefined ? paddingLeft : 0}px;`
    }
    return cssString
}
 
// function to return color and background color css variables
const getColor = async (json) => {
    let cssString = ''
    if (json?.fills[0]?.color) {
        if (json.type === 'TEXT'){
            cssString += `color: ${getRGBA(json.fills[0].color)};`
        } else {
            cssString += `background-color: ${getRGBA(json.fills[0].color)};`
        }
    }
    return cssString
}

// function to return box shadow css
const getBoxShadow = async (json) => {
    let cssString = ''
    const effectsArray = json.effects
    if (effectsArray.length > 0){
        let dropShadowJson = effectsArray.find(effect => effect.type === 'DROP_SHADOW')
        const color = getRGBA(dropShadowJson.color)
        const xValue = dropShadowJson.offset.x
        const yValue = dropShadowJson.offset.y
        const radius = dropShadowJson.radius
        const spread = dropShadowJson.spread ? `${dropShadowJson.spread}px` : '0px'
        cssString += `box-shadow: ${xValue}px ${yValue}px ${radius}px ${spread} ${color};`
    }
    return cssString
}

// main function to run on each figma-component and return css-code based on json from Figma
const generateCssPerComponent = async (json) => {
    const name = removeDollarSignSubString(json.name)
    const componentName = makePascalCase(name)
    let componentCss = ''
    componentCss += await getFlex(json)
    componentCss += await getPadding(json)
    componentCss += await getColor(json)
    componentCss += await getBorder(json)
    componentCss += await getFont(json)
    componentCss += await getBoxShadow(json)

    return (`
        .${componentName} {
            ${componentCss}
        }
    `)
}
  
export const generateCss = async (json) => {
    let css = ''
    css += await generateCssPerComponent(json)
    if (json.children){
        const children = json.children
        const childPromises = children.map(async (child) => {
            return generateCss(child)
        })
        const childrenCss = await Promise.all(childPromises)
        css += childrenCss.join('')
    }

    return css
}