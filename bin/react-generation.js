import { makePascalCase } from "./utils.js"

const elementTypes = [{
    type: 'button',
    searchText: ['button', 'btn'],
    doNotUse: ['buttons', 'btns']
},{
    type: 'a',
    searchText: ['link', 'anchor'],
    doNotUse: ['links']
},{
    type: 'nav',
    searchText: ['nav', 'navigation'],
    doNotUse: []
},{
    type: 'header',
    searchText: ['header'],
    doNotUse: []
},{
    type: 'footer',
    searchText: ['footer'],
    doNotUse: []
}]

const checkSemantics = (node) => {
    const {name, type} = node
    let element = 'div'

    if (type === 'TEXT'){
        element = 'p'
    }

    elementTypes.forEach(obj => {
        let shouldUseType = false;
        obj.searchText.forEach(searchText => {
            if (name.toLowerCase().includes(searchText)) {
                shouldUseType = true;
            }
        })
        obj.doNotUse.forEach(doNotUse => {
            if (name.toLowerCase().includes(doNotUse)) {
                shouldUseType = false;
            }
        })
        if (shouldUseType) {
            element = obj.type;
        }
    })

    return element
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
    const {type, name} = node

    const element = checkSemantics(node)
    const innerHtml = getInnerHtml(node)

    let codeString = `
        <${element} className={styles.${makePascalCase(name)}}>
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