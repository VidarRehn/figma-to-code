
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

export const getOAuthToken = async (obtainedCode) => {
    let response = await fetch('https://www.figma.com/api/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          code: obtainedCode,
          grant_type: 'authorization_code'
        })
      })
    let data = response.json()
    return data
}