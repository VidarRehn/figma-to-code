
export const cssTemplate = (content) => {
    return (`
    .container {
        ${content}
    }
    `)
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

const getRGBA = (colorObject) => {
    let {r, g, b, a} = colorObject
    r = Math.round(r * 255)
    g = Math.round(g * 255)
    b = Math.round(b * 255)
    return `rgba(${r}, ${g}, ${b}, ${a});`
}

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
        cssString += `background-color: ${getRGBA(json.backgroundColor)};`
    }
    return cssString
}
  
export const generateCss = async (json) => {
    let cssString = ''
    cssString += await getFlex(json)
    cssString += await getBoxModel(json)
    cssString += await getColor(json)
    cssString += await getBorder(json)

    return cssString
}