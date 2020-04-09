import { alerts } from '../../../utils/alerts'

export default async function fetchTemplates (namespace, extraHeaders, url) {
  const headers = new Headers()
  headers.append('accept', 'application/json, text/javascript, */*; q=0.01')
  if (extraHeaders) {
    for (const key of Object.keys(extraHeaders)) {
      headers.append(key, extraHeaders[key])
    }
  }

  const fullPath = `${url}${namespace}`
  const request = new Request(fullPath, { headers })

  try {
    const response = await fetch(request)
    const data = await response.json()

    return data
  } catch (e) {
    alerts.alertError('Feil', 'Klarte ikke hente maler fra databasen!')
    console.error(e)
  }
}
