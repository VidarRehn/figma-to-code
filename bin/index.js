#! /usr/bin/env node 

import yargs from "yargs"
import { hideBin } from 'yargs/helpers'
import fetch from "node-fetch"
import Configstore from "configstore"
import inquirer from "inquirer"
import path from 'path'

import { makePascalCase, createDirectory, writeAndFormatFile } from "./utils.js"
import { generateCssFile, cssTemplate } from "./style-generation.js"
import { reactTemplate } from "./react-generation.js"
import { initOptions, listOptions, checkForChildren } from "./prompts.js"

const config = new Configstore('figma-to-code-cli')

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

const generateFiles = async (data, name) => {
  const componentName = makePascalCase(name)

  const jsonDir = './data';
  await createDirectory(jsonDir)

  const componentDir = `./src/components/${componentName}`
  await createDirectory(componentDir)

  const jsonFilePath = path.join(jsonDir, `${componentName}.json`);
  const componentFilePath = path.join(componentDir, `${componentName}.jsx`)
  const styleFilePath = path.join(componentDir, `styles.module.css`)

  await writeAndFormatFile(jsonFilePath, JSON.stringify(data), 'json')
  await writeAndFormatFile(componentFilePath, reactTemplate(componentName), 'babel')

  const css = await generateCssFile(data)  
  await writeAndFormatFile(styleFilePath, css, 'css')
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
    }
  } else {
    await generateFiles(componentData, componentName)
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
          const {accessToken, documentId, projectType} = setup
          const components = await getFigmaFile(accessToken, documentId)
          const answers = await inquirer.prompt(listOptions(components))
          let chosenComponentName = answers.chosenComponent
          let chosenComponentData = components.find(comp => comp.name === chosenComponentName)
          await chooseComponent(chosenComponentData, chosenComponentName)
        } else {
          console.log('You need to initialize your project. Run command "ftc init"')
        }
      }
  }).parse()


