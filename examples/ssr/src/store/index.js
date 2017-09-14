import Vue from 'vue'
import Store from 'vue-light-store'
import user from './user'

Vue.use(Store)

export default function() {
  return new Store({
    user
  })
}
