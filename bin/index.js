#! /usr/bin/env node 

import yargs from "yargs"
import { hideBin } from 'yargs/helpers'
import Configstore from "configstore"
import open from "open"
import express from 'express'
import fetch from "node-fetch"

import { getExpirationTimestamp, isTokenActive, getOAuthToken } from "./utils.js"

const app = express()
const config = new Configstore('figma-to-code')

const clientId = 'uapNnOBTvQRvwRt6H7F6ci'
const clientSecret = 'FWJ9hLGAu7HYfR9jRaWeERD8anWWoH'
const redirectUri = 'http://localhost:5500/callback.html'
const documentId = 'VMcmHxqTpcKiqLHQtKvu2c'

yargs(hideBin(process.argv))
  .command({
      command: 'login',
      describe: 'authenticate Figma',
      handler: async () => {

          app.listen(5500, () => {console.log('Server listening on port 5500')})            

          const authUrl = `https://www.figma.com/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=file_read&state=:state&response_type=code`
          const browser = open(authUrl)

          // om browser stängs så måste vi exitta processen

          app.get('/callback.html', async (req, res) => {
              const data = await getOAuthToken(req.query.code)
              const userAccess = {
                token: data.access_token,
                expiry: await getExpirationTimestamp(data.expires_in)
              } 
              config.set({userAccess})
              process.exit()
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
        if (userAccess && isTokenActive(userAccess.expiry)) {
          const response = await fetch(`https://api.figma.com/v1/files/${documentId}`, {
            headers: {
              'Authorization': `Bearer ${userAccess.token}`
            }
          })
          const data = await response.json()
          console.log(data)
        } else {
          console.log('You are not authenticated. Use "ftc login"')
        }
      }
  }).parse()


