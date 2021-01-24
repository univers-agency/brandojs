
export default function serializeProperties (entry, serializeProperties) {
  for (let i = 0; i < serializeProperties.length; i++) {
    if (!Object.prototype.hasOwnProperty.call(entry, serializeProperties[i])) {
      continue
    }
    entry[serializeProperties[i]] = JSON.stringify(entry[serializeProperties[i]])
  }
}
