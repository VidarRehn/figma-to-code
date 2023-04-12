import fetch from "node-fetch"
import * as dotenv from 'dotenv'

dotenv.config()

export const getExpirationTimestamp = async (expiry) => {
    const today = new Date()
    const currentTime = today.getTime()
    const expirationTime = currentTime + (expiry * 1000)
    return expirationTime
}

export const isTokenActive = (expiry) => {
    const today = new Date()
    const currentTime = today.getTime()
    if (expiry > currentTime){
        return true
    } else {
        return false
    }
}

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