
export const reactTemplate = (componentName) => {
    return (`
    import styles from "./styles.module.css"

    const ${componentName} = (props) => {
        return (
            <div className={styles.container}>
                <p>testing testing</p>
            </div>
        )
    }

    export default ${componentName}
    `)
}  