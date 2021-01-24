import clone from './clone'

export default function stripParams (params, toStrip) {
  const val = clone(params)
  for (let i = 0; i < toStrip.length; i++) {
    delete val[toStrip[i]]
  }
  return val
}
