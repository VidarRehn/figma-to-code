import { makePascalCase, removeDollarSignSubString } from "./utils.js"

// function to check if Figma name includes substring with $-sign. If so use that as element type.
const getElementType = (node) => {
    const name = node.name
    const regex = /\$([a-zA-Z0-9]+)/
    const match = name.match(regex);
    return match ? match[1] : 'div';
}

// function to check if an element has text inside of it or if it contains child-elements
const getInnerHtml = (node) => {
    let innerHtml = ''
    if (node.characters){
        innerHtml = node.characters
    } else if (node.children) {
        innerHtml = node.children.map(child => elementTemplate(child)).join('')
    }
    return innerHtml
}

// function to return an element fragment code string
export const elementTemplate = (node) => {
    let ref = ''
    const name = removeDollarSignSubString(node.name)
    const element = getElementType(node)

    if (element === 'a') ref = 'href="#"' 
    if (element === 'img') ref = 'src=""'

    const innerHtml = getInnerHtml(node)

    let codeString = `
        <${element} ${ref} className={styles.${makePascalCase(name)}}>
            ${innerHtml}
        </${element}>
    `
    return codeString
}

// function to return a jsx-template code-string
export const reactTemplate = (componentName, componentData) => {
    const name = makePascalCase(componentName)
    const content = elementTemplate(componentData)
    return (`
    import styles from "./styles.module.css"

    const ${name} = () => {
        return (
            ${content}
        )
    }

    export default ${name}
    `)
}  