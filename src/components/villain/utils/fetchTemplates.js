import { alerts } from '../../../utils/alerts'

export default async function fetchTemplates (namespace, extraHeaders, url) {
  let request
  let headers = new Headers()
  headers.append('accept', 'application/json, text/javascript, */*; q=0.01')

  if (extraHeaders) {
    for (let key of Object.keys(extraHeaders)) {
      headers.append(key, extraHeaders[key])
    }
  }

  let fullPath = `${url}${namespace}`
  request = new Request(fullPath, { headers })

  try {
    let response = await fetch(request)
    let data = await response.json()

    return data
  } catch (e) {
    alerts.alertError('Feil', 'Klarte ikke hente maler fra databasen!')
    console.error(e)
  }
}
