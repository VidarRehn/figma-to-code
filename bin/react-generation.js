import { makePascalCase, removeDollarSignSubString } from "./utils.js"

const getElementType = (node) => {
    const name = node.name
    const regex = /\$([a-zA-Z0-9]+)/
    const match = name.match(regex);
    return match ? match[1] : 'div';
}

const getInnerHtml = (node) => {
    let innerHtml = ''
    if (node.characters){
        innerHtml = node.characters
    } else if (node.children) {
        innerHtml = node.children.map(child => elementTemplate(child)).join('')
    }

    return innerHtml
}

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