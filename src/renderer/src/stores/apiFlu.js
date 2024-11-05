import axios from 'axios'
import {getError} from '../utils'
import {
  encaseP,
  map,
  chain,
  mapRej,
  chainRej,
  resolve,
  reject,
  parallel,
  fork
} from 'fluture'

const host = "http://localhost:3210"
export const Api = axios.create({
  baseURL: `${host}/`,
  timeout: 1000
})
const fapi = encaseP(Api)

export const submitLogin = (request) => fapi(
  ({
    method: "POST",
    url: 'login',
    data: {
      email: request.email,
      password: request.pass
    }
  })
)

export const api = {
  getToken: () => Api.defaults.headers.common['Authorization'],
  login: (request) => submitLogin(request)
    .pipe(fork 
      (rej => {throw Error(rej)}) 
      (res => Api.defaults.headers.common['Authorization'] = res.data.token 
      )
    ),
  logout: function() {
      APIEnd.defaults.headers.common['Authorization'] = null
  },
}

