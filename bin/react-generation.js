import { makePascalCase } from "./utils.js"

export const reactTemplate = (componentName) => {
    return (`
    import styles from "./styles.module.css"

    const ${componentName} = (props) => {
        return (
            <div className={styles.${makePascalCase(componentName)}}>
                <p>testing testing</p>
            </div>
        )
    }

    export default ${componentName}
    `)
}  