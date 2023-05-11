#! /usr/bin/env node 

import yargs from "yargs"
import { hideBin } from 'yargs/helpers'
import fetch from "node-fetch"
import Configstore from "configstore"
import inquirer from "inquirer"
import path from 'path'

import { generateCss } from "./style-generation.js"
import { reactTemplate } from "./react-generation.js"
import { makePascalCase, createDirectory, writeAndFormatFile, getIdFromString, getNameFromString, checkIfIdExists, removeDollarSignSubString, checkIfComponentExistsInFile } from "./utils.js"
import { initOptions, listOptions, checkForChildren, usedComponentsList, confirmRegeneration, changeDoc } from "./prompts.js"

// function to create a config-store in users drive to save variables
const config = new Configstore(`figma-to-code-${path.basename(process.cwd())}`)

// function to fetch a specified Figma document file and return its top-level children
const getFigmaFile = async (token, id) => {
  try {
    const response = await fetch(`https://api.figma.com/v1/files/${id}/`, {
        headers: {
            "X-Figma-Token": token
        }
    })
    const data = await response.json()
    return data.document.children[0].children
  } catch (error) {
    throw new Error(`Unable to get Figma file: ${error}`)
  }
}

// function to fetch a specific Figma Design node based on its node-id
const getSingleNode = async (token, key, nodeId) => {
  try {
    const response = await fetch(`https://api.figma.com/v1/files/${key}/nodes?ids=${nodeId}`, {
        headers: {
            "X-Figma-Token": token
        }
    })
    const data = await response.json()
    return data.nodes[nodeId].document
  } catch (error) {
    throw new Error(`Unable to get Figma file: ${error}`)
  }
}

// function to generate json, jsx and css.module files for the chosen design
const generateFiles = async (data, name) => {
  // convert the name to pascal case
  const componentName = makePascalCase(name)
  // get project configuration from configStore
  const setup = config.get('setup')
  // create directory for the files
  const componentDir = setup.projectType === 'React' ? `./src/components/${componentName}` : `./components/${componentName}`
  await createDirectory(componentDir)
  // set the file names
  const jsonFilePath = path.join(componentDir, `${componentName}.json`);
  const componentFilePath = path.join(componentDir, `${componentName}.jsx`)
  const styleFilePath = path.join(componentDir, `styles.module.css`)
  // write the json and jsx files and format them using prettier
  await writeAndFormatFile(jsonFilePath, JSON.stringify(data), 'json')
  await writeAndFormatFile(componentFilePath, reactTemplate(componentName, data), 'babel')
  // generate css code based on json from Figma
  const css = await generateCss(data)  
  // write the css file and format using prettier
  await writeAndFormatFile(styleFilePath, css, 'css')
}

// function to save name and id of components created in the config-store
const handleComponentStore = (componentData) => {
  if (config.get('componentList')){
    let list = config.get('componentList')
    let obj = {
      name: componentData.name,
      id: componentData.id
    }
    if (!checkIfIdExists(list, componentData.id)){
      list.push(obj)
      config.set('componentList', list)
    }
  } else {
    config.set('componentList', [{
      name: componentData.name,
      id: componentData.id
    }])
  }
}

// fucntion to check if a chosen Figma design has children and ask whether to generate files for the parent or to see a list of the children
const chooseComponent = async (componentData, componentName) => {
  if (componentData?.children?.length > 1) {
    // ask user if they want to use parent or see the children
    const answers = await inquirer.prompt(checkForChildren)
    if (answers.childrenOrParent.includes('children')) {
      // list the children
      const answers = await inquirer.prompt(listOptions(componentData.children))
      const chosenChildName = getNameFromString(answers.chosenComponent)
      const nameWithoutSubString = removeDollarSignSubString(chosenChildName)
      const chosenChildData = componentData.children.find(comp => comp.name === chosenChildName)
      // if also the child has children, repeat the process
      await chooseComponent(chosenChildData, nameWithoutSubString)
    } else {
      await generateFiles(componentData, componentName)
      console.log('Files succesfully generated')
      handleComponentStore(componentData)
    }
  } else {
    await generateFiles(componentData, componentName)
    console.log('Files succesfully generated')
    handleComponentStore(componentData)
  }
}

// set terminal commands and functions to run on each prompt 
yargs(hideBin(process.argv))
  .command({
    // prompt "ftc init"
    command: 'init',
    describe: 'Initialize figma-to-code and set environment',
    handler: async () => {
      // ask user questions regarding Figma Access Token, Document ID etc
      const answers = await inquirer.prompt(Object.values(initOptions))
      // save user answers in an object called setup
      let setup = {}
      Object.entries(answers).forEach(([key, value]) => {
        setup[key] = value
      });
      // save setup-object in the config-store on the users drive
      config.set({setup})
      console.log('Configuration data successfully saved')
    }
  })
  .command({
      // prompt "ftc clear"
      command: 'clear',
      describe: 'clear config',
      // clear the config-store (removing access token, document id etc) 
      handler: () => {
        config.clear()
        console.log('Configuration data successfully removed')
      }
  })
  .command({
      //prompt "ftc list"
      command: 'list',
      describe: 'get your Figma components',
      handler: async () => {
        // get project details from config-store
        const setup = config.get('setup')
        if (setup) {
          const {accessToken, documentId} = setup
          // fetch the figma design file 
          const components = await getFigmaFile(accessToken, documentId)
          // list the Figma design nodes(components) in the terminal
          const answers = await inquirer.prompt(listOptions(components))
          // save user answer without the id
          let chosenComponentName = getNameFromString(answers.chosenComponent)
          let nameWithoutSubString = removeDollarSignSubString(chosenComponentName)
          // find data based on users answer
          let chosenComponentData = components.find(comp => comp.name === chosenComponentName)
          // check if design has children and/or generate files
          await chooseComponent(chosenComponentData, nameWithoutSubString)
        } else {
          // if no Figma Access token, Document ID etc, ask the user to initialize their project
          console.log('You need to initialize your project. Run command "ftc init"')
        }
      }
  })
  .command({
    command: 'test',
    describe: 'test',
    handler: async () => {
      console.log('test')
    }
  })
  .command({
    command: 'change-doc',
    describe: 'change the Figma Document ID',
    handler: async () => {
      const {documentId} = await inquirer.prompt(changeDoc)
      config.set('setup.documentId', documentId)
    }
  })
  .command({
    // prompt "ftc get <name>"
    command: 'get <arg>',
    describe: 'console logs string in command (arg)',
    handler: async (argv) => {
      // get project details from config-store
      const setup = config.get('setup')
      if (setup) {
        const {accessToken, documentId} = setup
        // get Figma file
        const components = await getFigmaFile(accessToken, documentId)
        // check if there are frames within the Figma File that matches your name argument
        const matchingComponents = checkIfComponentExistsInFile(components[0], argv.arg)
        if (matchingComponents.length > 0){
          // list any matching frames and receive user choice
          const answers = await inquirer.prompt(listOptions(matchingComponents))
          let chosenComponentName = getNameFromString(answers.chosenComponent)
          let nameWithoutSubString = removeDollarSignSubString(chosenComponentName)
          let chosenComponentData = matchingComponents.find(comp => comp.name === chosenComponentName)
          await generateFiles(chosenComponentData, nameWithoutSubString)
          console.log('Files succesfully generated')
          handleComponentStore(chosenComponentData)
        } else {
          console.log(`There are no designs matching "${argv.arg}"`)
        }
      } else {
        console.log('You need to initialize your project. Run command "ftc init"')
      }
    }
  })
  .command({
    // prompt "ftc refresh"
    command: 'refresh',
    describe: 'refresh components',
    handler: async () => {
      // get a list of previously generated components from config-store
      const componentsArray = config.get('componentList')
      if (componentsArray){
        // list the components in the terminal
        const answers = await inquirer.prompt(usedComponentsList(componentsArray))
        // save user choice
        const chosenComponent = answers.chosenComponent
        // tell user that files will be overwritten and ask them to confirm
        const confirm = await inquirer.prompt(confirmRegeneration)
        if (confirm.overwrite){
          const setup = config.get('setup')
          if (setup){
            // get Figma access token, document id etc from config-store
            const {accessToken, documentId} = setup
            if (chosenComponent === 'All'){
              // remove 'All' from array of options
              componentsArray.pop()
              // fetch data and generate files for each component
              componentsArray.forEach(async (comp) => {
                const nameWithoutSubString = removeDollarSignSubString(comp.name)
                const node = await getSingleNode(accessToken, documentId, comp.id)
                await generateFiles(node, nameWithoutSubString)
                console.log('Files sucessfully refreshed')
              })
            } else {
              const nodeId = getIdFromString(chosenComponent)
              const chosenComponentName = getNameFromString(chosenComponent)
              const nameWithoutSubString = removeDollarSignSubString(chosenComponentName)
              // fetch data for chosen component
              const node = await getSingleNode(accessToken, documentId, nodeId)
              // generate new files
              await generateFiles(node, nameWithoutSubString)
              console.log('File sucessfully refreshed')
            }
          }
        }
      } else {
        // if no components have been generated before the user is prompted to first run "ftc list"
        console.log('You havent used any figma components in your project. Use "ftc list" to see your options.')
      }
    }
}).parse()