// oAuth

import fetch from "node-fetch"
import dotenv from 'dotenv'
import open from "open"
import Configstore from "configstore"
import express from "express"

dotenv.config()
const app = express()
const config = new Configstore('figma-to-code-old')

export const getOAuthToken = async (code) => {
    try {
      let response = await fetch('https://www.figma.com/api/oauth/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            redirect_uri: process.env.REDIRECT_URI,
            code: code,
            grant_type: 'authorization_code'
          })
        })
      let data = response.json()
      return data
    } catch (err) {
      console.log(err)
    }
}

export const getDocumentFrames = async (id, token) => {
    try {
      const response = await fetch(`https://api.figma.com/v1/files/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      return data.document.children[0].children
    } catch (err) {
      console.log(err)
    }
}

export const getExpirationTimestamp = (expiry) => {
    const today = new Date()
    const currentTime = today.getTime()
    return currentTime + (expiry * 1000)
}
  
  export const isTokenActive = (expiry) => {
    const today = new Date()
    const currentTime = today.getTime()
    return expiry > currentTime
}

yargs(hideBin(process.argv))
  .command({
    command: 'login',
    describe: 'authenticate Figma',
    handler: async () => {
      app.listen(5500)            
      const authUrl = `https://www.figma.com/oauth?client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&scope=file_read&state=:state&response_type=code`
      const browser = open(authUrl)
      app.get('/callback.html', async (req, res) => {
        try {
          const code = req.query.code
          const data = await getOAuthToken(code)
          const userAccess = {
            token: data.access_token,
            expiry: getExpirationTimestamp(data.expires_in)
          } 
          config.set({userAccess})
          process.exit()
        } catch (err) {
          throw new Error('Could not authenticate Figma.')
        }
      })
    }
  })
  .parse()