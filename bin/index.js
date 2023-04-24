#! /usr/bin/env node 

import yargs from "yargs"
import { hideBin } from 'yargs/helpers'
import fetch from "node-fetch"
import Configstore from "configstore"
import inquirer from "inquirer"
import path from 'path'

import { makePascalCase, createDirectory, writeAndFormatFile, getIdFromString, getNameFromString } from "./utils.js"
import { generateCss } from "./style-generation.js"
import { reactTemplate } from "./react-generation.js"
import { initOptions, listOptions, checkForChildren, usedComponentsList, confirmRegeneration } from "./prompts.js"

const config = new Configstore(`figma-to-code-${path.basename(process.cwd())}`)

// functions

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

const generateFiles = async (data, name) => {
  const componentName = makePascalCase(name)
  const setup = config.get('setup')

  const jsonDir = './data';
  await createDirectory(jsonDir)

  const componentDir = setup.projectType === 'React' ? `./src/components/${componentName}` : `./components/${componentName}`
  await createDirectory(componentDir)

  const jsonFilePath = path.join(jsonDir, `${componentName}.json`);
  const fileEnding = setup.typescript ? 'tsx' : 'jsx'
  const componentFilePath = path.join(componentDir, `${componentName}.${fileEnding}`)
  const styleFilePath = path.join(componentDir, `styles.module.css`)

  await writeAndFormatFile(jsonFilePath, JSON.stringify(data), 'json')
  await writeAndFormatFile(componentFilePath, reactTemplate(componentName, data), 'babel')

  const css = await generateCss(data)  
  await writeAndFormatFile(styleFilePath, css, 'css')
}

const handleComponentStore = (componentData) => {
  if (config.get('componentList')){
    let list = config.get('componentList')
    list.push({
      name: componentData.name,
      id: componentData.id
    })
    config.set('componentList', list)
  } else {
    config.set('componentList', [{
      name: componentData.name,
      id: componentData.id
    }])
  }
}

const chooseComponent = async (componentData, componentName) => {
  if (componentData?.children?.length > 1) {
    const answers = await inquirer.prompt(checkForChildren)
    if (answers.childrenOrParent.includes('children')) {
      const answers = await inquirer.prompt(listOptions(componentData.children))
      const chosenChildName = answers.chosenComponent
      const chosenChildData = componentData.children.find(comp => comp.name === chosenChildName)
      await chooseComponent(chosenChildData, chosenChildName)
    } else {
      await generateFiles(componentData, componentName)
      handleComponentStore(componentData)
    }
  } else {
    await generateFiles(componentData, componentName)
    handleComponentStore(componentData)
  }
}

// commands

yargs(hideBin(process.argv))
  .command({
    command: 'init',
    describe: 'Initialize figma-to-code and set environment',
    handler: async () => {
      const answers = await inquirer.prompt(Object.values(initOptions))
      let setup = {}
      Object.entries(answers).forEach(([key, value]) => {
        setup[key] = value
      });
      config.set({setup})
    }
  })
  .command({
      command: 'clear',
      describe: 'clear config',
      handler: () => config.clear()
  })
  .command({
      command: 'list',
      describe: 'get your Figma components',
      handler: async () => {
        const setup = config.get('setup')
        if (setup) {
          const {accessToken, documentId} = setup
          const components = await getFigmaFile(accessToken, documentId)
          const answers = await inquirer.prompt(listOptions(components))
          let chosenComponentName = answers.chosenComponent
          let chosenComponentData = components.find(comp => comp.name === chosenComponentName)
          await chooseComponent(chosenComponentData, chosenComponentName)
        } else {
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
    command: 'refresh',
    describe: 'refresh components',
    handler: async () => {
      const componentsArray = config.get('componentList')
      if (componentsArray){
        const answers = await inquirer.prompt(usedComponentsList(componentsArray))
        const chosenComponent = answers.chosenComponent
        const confirm = await inquirer.prompt(confirmRegeneration)
        if (confirm.overwrite){
          const setup = config.get('setup')
          if (setup){
            const nodeId = getIdFromString(chosenComponent)
            const chosenComponentName = getNameFromString(chosenComponent)
            const {accessToken, documentId} = setup
            const node = await getSingleNode(accessToken, documentId, nodeId)
            await generateFiles(node, chosenComponentName)
          }
        }
      } else {
        console.log('You havent used any figma components in your project. Use "ftc list" to see your options.')
      }
    }
}).parse()