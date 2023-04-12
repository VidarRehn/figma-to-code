import fetch from "node-fetch"

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