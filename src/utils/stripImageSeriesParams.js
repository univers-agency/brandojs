import stripParams from './stripParams'

export default function stripImageSeriesParams (params) {
  delete params.image_series.cfg
  delete params.image_series.creator
  delete params.image_series.__typename

  for (let i = 0; i < params.image_series.images.length; i++) {
    if (!(params.image_series.images[i] instanceof File) && params.image_series.images[i] !== null) {
      stripParams(params.image_series.images[i], ['__typename', 'thumb', 'medium'])
      params.image_series.images[i] = JSON.stringify(params.image_series.images[i])
    }
  }
}
