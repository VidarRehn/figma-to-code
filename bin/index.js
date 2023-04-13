#! /usr/bin/env node 

import yargs from "yargs"
import { hideBin } from 'yargs/helpers'
import Configstore from "configstore"
import inquirer from "inquirer"

import { getFigmaFile, generateFiles } from './utils.js'
import { initOptions, listOptions, checkForChildren } from "./prompts.js"

const config = new Configstore('figma-to-code-cli')

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
          if (chosenComponentData?.children?.length > 1){
            const childComponents = chosenComponentData.children
            const answers = await inquirer.prompt(checkForChildren)
            if (answers.childrenOrParent.includes('children')){
              const answers = await inquirer.prompt(listOptions(childComponents))
              chosenComponentName = answers.chosenComponent
              chosenComponentData = childComponents.find(comp => comp.name === chosenComponentName)
            }
          }

          await generateFiles(chosenComponentData, chosenComponentName)

        } else {
          console.log('You need to initialize your project. Run command "ftc init"')
        }
      }
  }).parse()


