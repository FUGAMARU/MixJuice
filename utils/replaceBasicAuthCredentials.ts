const STR = "[WEBDAV_SERVER_CREDENTIALS]"

export const replaceStringToBasicAuthCredentials = (
  url: string,
  address: string,
  user: string,
  password: string
) => {
  const pattern = /https?:\/\//g
  const protocolRemovedAddress = address.replace(pattern, "")
  return url.replace(STR, `${user}:${password}@${protocolRemovedAddress}`)
}

export const replaceBasicAuthCredentialsToString = (url: string) => {
  const pattern = /\/\/(.*?@)(.*?)(:\d+)?(?=\/)/
  return url.replace(pattern, `//${STR}`)
}
