import { makePascalCase } from "./utils.js"

export const elementTemplate = (node) => {
    const type = node.type
    const name = makePascalCase(node.name)
    let innerHtml = null
    if (node.characters){
        innerHtml = node.characters
    } 
    else if (node.children) {
        innerHtml = node.children.map(child => elementTemplate(child))
    }

    let codeString = `
        <${type} className={styles.${name}}>
            ${innerHtml}
        </${type}>
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