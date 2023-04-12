#! /usr/bin/env node 

import yargs from "yargs"
import { hideBin } from 'yargs/helpers'
import Configstore from "configstore"
import open from "open"
import express from 'express'
import * as dotenv from 'dotenv'
import inquirer from "inquirer"

import { getExpirationTimestamp, isTokenActive, getOAuthToken, getDocumentFrames, writeFiles } from "./utils.js"

dotenv.config()
const app = express()
const config = new Configstore('figma-to-code')

yargs(hideBin(process.argv))
  .command({
    command: 'login',
    describe: 'authenticate Figma',
    handler: async () => {
        app.listen(5500)            
        const authUrl = `https://www.figma.com/oauth?client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&scope=file_read&state=:state&response_type=code`
        const browser = open(authUrl)
        // om browser stängs så måste vi exitta processen
        app.get('/callback.html', async (req, res) => {
          try {
            const code = req.query.code
            const data = await getOAuthToken(code)
            const userAccess = {
              token: data.access_token,
              expiry: await getExpirationTimestamp(data.expires_in)
            } 
            // här skulle jag gärna stänga browsern automatiskt, alternativt routa till en schysst "tack för att du loggat in"-sida
            config.set({userAccess})
            process.exit()
          } catch (err) {
            console.log(err)
            process.exit()
          }
        })
    }
  }).parse()

yargs(hideBin(process.argv))
  .command({
      command: 'clear',
      describe: 'clear config',
      handler: () => config.clear()
  }).parse()

yargs(hideBin(process.argv))
  .command({
      command: 'set-document',
      describe: 'Set the Figma document you would like to access',
      handler: async () => {
        const documentId = await inquirer.prompt({
          message: 'What is your Figma Document ID?',
          name: 'document_id',
          demandOption: true,
          describe: 'Which Figma file are you trying to access',
          type: 'String'
        })
        config.set({documentId})
      }
  }).parse()

yargs(hideBin(process.argv))
  .command({
      command: 'list',
      describe: 'get your Figma components',
      handler: async () => {
        const userAccess = config.get('userAccess')
        if (userAccess) {
          if (isTokenActive(userAccess.expiry)){
            if (config.has('documentId')){
              const {document_id} = config.get('documentId')
              // hämta data från Figma
              const components = await getDocumentFrames(document_id, userAccess.token)
              // fråga användare vilken komponents de vill använda
              const { chosen } = await inquirer.prompt({
                type: 'list',
                name: 'chosen',
                message: 'Select the component you want to use',
                choices: components.map(comp => comp.name)
              })
              
              // hämta komponent-data
              const componentData = components.find(comp => comp.name === chosen)

              // kolla om frame har children och fråga isf om man vill skapa egna komponenter för dessa
              if (componentData.children && componentData.children.length > 1){
                let { answer } = await inquirer.prompt({
                  type: 'list',
                  name: 'answer',
                  message: 'This component has children. Do you want to:',
                  choices: ['Use the parent component', 'See the children']
                })

                if (answer.includes('children')){
                  const components = componentData.children
                  const { chosen } = await inquirer.prompt({
                    type: 'list',
                    name: 'chosen',
                    message: 'Select the component you want to use',
                    choices: components.map(comp => comp.name)
                  })

                  const data = components.find(comp => comp.name === chosen)
                  await writeFiles(data, chosen)

                } else {
                  await writeFiles(componentData, chosen)
                }
              } else {
                await writeFiles(componentData, chosen)
              }
              

            } else {
              console.log('The document ID is not set. Please run "ftc set-document"')
            }
          } else {
            console.log('Your access token has expired. Please use "ftc login" to re-authenticate yourself')
          }
        } else {
          console.log('You are not authenticated. Please use "ftc login"')
        }
      }
  }).parse()


