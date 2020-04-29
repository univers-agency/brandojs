import stripParams from './stripParams'

export default function validateImageParams (params, imageParams) {
  console.log('==> validateImageParams: params before', params)
  for (let i = 0; i < imageParams.length; i++) {
    if (!params.hasOwnProperty(imageParams[i])) {
      continue
    }
    if (!(params[imageParams[i]] instanceof File) && params[imageParams[i]] !== null) {
      console.log('found something')
      stripParams(params[imageParams[i]], ['__typename', 'thumb'])
      params[imageParams[i]] = JSON.stringify(params[imageParams[i]])
    }
  }
  console.log('==> validateImageParams: params after', params)
}
