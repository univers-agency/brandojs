/* TODO: extract to vue-phoenix-socket */

import { Socket } from 'phoenix'
import { resolve } from 'any-promise'

export default {
  // The install method will be called with the Vue constructor as
  // the first argument, along with possible options
  install (Vue, callback) {
    Vue.prototype.connectSocket = function (callback) {
      return new Promise(resolve => {
        const token = localStorage.getItem('token')
        let connectionEstablishedOnce = false
        let socket = new Socket('/admin/socket', { params: { guardian_token: token } })

        const onConnectionEstablished = (socket, longpoll = false) => {
          if (!connectionEstablishedOnce) {
            connectionEstablishedOnce = true

            if (longpoll) {
              Vue.prototype.$socket = socket
              callback()
            }

            resolve()
          }
        }

        socket.onOpen(() => { onConnectionEstablished(socket) })

        socket.onError(() => {
          if (!connectionEstablishedOnce) {
            console.log('==> WS failed—trying longpoll')
            socket.disconnect(null, 3000)
            socket = new Socket('/admin/socket', { transport: LongPoll, params: { guardian_token: token } })
            socket.onOpen(() => onConnectionEstablished(socket, true))
            socket.connect()
          } else {
            Vue.prototype.$toast.error('WS server connection failed', { theme: 'error' })
          }
        })

        socket.onClose(err => {
          console.error('socket.onClose', err)
        })

        socket.connect()
        Vue.prototype.$socket = socket
      })
    }
  }
}
