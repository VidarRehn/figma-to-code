#! /usr/bin/env node 

import yargs from "yargs"
import { hideBin } from 'yargs/helpers'
import Configstore from "configstore"
import open from "open"
import express from 'express'
import fetch from "node-fetch"
import * as dotenv from 'dotenv'

import { getExpirationTimestamp, isTokenActive, getOAuthToken } from "./utils.js"

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
      command: 'document',
      describe: 'get figma doc',
      handler: async () => {
        const userAccess = config.get('userAccess')
        if (userAccess) {
          if (isTokenActive(userAccess.expiry)){
            const response = await fetch(`https://api.figma.com/v1/files/${process.env.DOCUMENT_ID}`, {
              headers: {
                'Authorization': `Bearer ${userAccess.token}`
              }
            })
            const data = await response.json()
            console.log(data)
          } else {
            console.log('Your access token has expired. Please use "ftc login" to re-authenticate yourself')
          }
        } else {
          console.log('You are not authenticated. Please use "ftc login"')
        }
      }
  }).parse()


