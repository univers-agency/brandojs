import { alerts } from '../../../utils/alerts'

export default async function deleteTemplate (template, extraHeaders, url, toast) {
  let deleteUrl = `${url}delete`
  let request
  let headers = new Headers()
  headers.append('accept', 'application/json, text/javascript, */*; q=0.01')

  if (extraHeaders) {
    for (let key of Object.keys(extraHeaders)) {
      headers.append(key, extraHeaders[key])
    }
  }

  const formData = new FormData()
  formData.append('id', template.data.id)
  request = new Request(deleteUrl, { headers, method: 'post', body: formData })

  try {
    let response = await fetch(request)
    let data = await response.json()

    if (data.status === 200) {
      toast.success({ message: 'Malen ble slettet' })
      return data
    }
  } catch (e) {
    alerts.alertError('Feil', 'Feil ved sletting av mal i database.')
    console.error(e)
  }
}
