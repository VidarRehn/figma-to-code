import { makePascalCase } from "./utils.js"

export const elementTemplate = (node) => {
    const {type, name} = node

    let actualType = ''
    if (name.toLowerCase().includes('button') && !name.toLowerCase().includes('buttons')){
        actualType = 'button'
    } else if (type === 'TEXT') {
        actualType = 'p'
    } else {
        actualType = 'div'
    }

    let innerHtml = ''
    if (node.characters){
        innerHtml = node.characters
    } 
    else if (node.children) {
        innerHtml = node.children.map(child => elementTemplate(child)).join('')
    }

    let codeString = `
        <${actualType} className={styles.${makePascalCase(name)}}>
            ${innerHtml}
        </${actualType}>
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