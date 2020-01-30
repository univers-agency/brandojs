import { alerts } from '../../../utils/alerts'

export default async function storeTemplate (template, extraHeaders, url) {
  let request
  let headers = new Headers()
  headers.append('accept', 'application/json, text/javascript, */*; q=0.01')

  if (extraHeaders) {
    for (let key of Object.keys(extraHeaders)) {
      headers.append(key, extraHeaders[key])
    }
  }

  const formData = new FormData()
  formData.append('template', JSON.stringify(template))
  request = new Request(url, { headers, method: 'post', body: formData })

  try {
    let response = await fetch(request)
    let data = await response.json()

    if (data.status === 200) {
      alerts.alertSuccess('OK', 'Malen ble lagret')
      return data
    }
  } catch (e) {
    alerts.alertError('Feil', 'Feil ved lagring av mal i database.')
    console.error(e)
  }
}
