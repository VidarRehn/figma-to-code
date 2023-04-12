
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

export const makePascalCase = (string) => {
  const separatedWords = string.split(" ");
  const pascalCase = separatedWords
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
  return pascalCase;
}
