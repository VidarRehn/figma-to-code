# **figma-to-code**

**'figma-to-code'** is a CLI tool that allows you to generate React components from your Figma designs via your terminal.

## **Installation**

You can install figma-to-code globally using npm:

```
npm install -g figma-to-code
```
Or locally in your project:
```
npm install figma-to-code --save-dev
```

## **Usage**

After installing figma-to-code, you can run the CLI using the **ftc** command inside your React/Next project.

### **Initialization**
Before you can use figma-to-code, you need to initialize the project. Run below prompt in the terminal.

```
ftc init
```
The terminal will ask you for your *Figma Access Token*, *Document ID* as well as what type of a project you are building.

Your *Figma Access Token* can be found via these steps:

1. Login to your Figma account.
2. Head to the account settings from the top-left menu inside Figma.
3. Find the personal access tokens section.
4. Click Create new token.
5. A token will be generated. Copy the token (this will only be possible once so make sure that you keep it stored somewhere where you can return to it later)

Your *Document ID* can be read from any Figma file URL. For example in: https://www.figma.com/file/12345/my-design, the ***Document ID*** is 12345.

The choice between whether you are in a React or Next project will decide whether files are generated inside ./src/components (React) or ./components (Next).

### **Getting your designs**
To see a list of your design, run:

```
ftc list
```
This will list all the top-level components of your Figma document.

Choose the component you want to generate, and figma-to-code will automatically create a new jsx-component in your project as well as a styles module. 

If you choose a component that itself contains child-components you will be asked whether to generate code for the top level component (parent) or to see a list of its children. 

### **Get a specific design**
To generate a specific design, you can search by entering a string that should be included in your design name. Run:

```
ftc get <string>
```
This will list all the Figma frames where the name includes your search-string. Select the design you want to use.

### **Regenerating Components**
If you make changes to your Figma designs, you can update your project files using figma-to-code.

To regenerate a component, run:

```
ftc refresh
```
This will list all of the components that have already been generated. Choose the component you want to regenerate, and figma-to-code will update the component in your project.

### **Changing document**
If you want to import a component from another Figma design you will need to change the project *Document ID*. Run:
```
ftc change-doc
```
The terminal will ask you to enter the new Document ID:

### **Remove access to your Figma**
If you want to remove project setup (access token, document ID, etc), run:

```
ftc clear
```

## **Best practice**

### **Naming & Semantic HTML**

It is important that you give names to your frames in Figma as that will decide the name of the component as well as the class for which the element will be styled. 

The element type will be a div unless otherwise stated in the name. To define the type, use $ followed by the element type you want generate

For example, namning a frame in Figma "action button $button" will generate a JSX file looking like below.

```JSX
import styles from "./styles.module.css";

const ActionButton = () => {
    return (
        <button className={styles.ActionButton}>
            innerHtml
        </button>
    )
}

export default ActionButton
```