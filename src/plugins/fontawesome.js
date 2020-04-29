import Vue from 'vue'

import { library, dom } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(fas)
library.add(fab)
dom.watch()
Vue.component('FontAwesomeIcon', FontAwesomeIcon)
