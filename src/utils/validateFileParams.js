export default function validateFileParams (params, fileParams) {
  for (let i = 0; i < fileParams.length; i++) {
    if (!params.hasOwnProperty(fileParams[i])) {
      continue
    }
    if (!(params[fileParams[i]] instanceof File) && params[fileParams[i]] !== null) {
      delete params[fileParams[i]]
    }
  }
}
