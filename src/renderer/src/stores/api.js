import axios from 'axios'
import {getError} from '../utils'

const host = "http://localhost:3210"
export const APIEnd = axios.create({
  baseURL: `${host}/`,
  timeout: 1000
})

export const api = {
  getToken: () => APIEnd.defaults.headers.common['Authorization'],
  login: async function(request) {
    // console.log(request)
    let data
    try {
      let res = await APIEnd.post('login', {
        email: request.email,
        password: request.pass
      })
      data = res.data
      APIEnd.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
      return data
    } catch (error) {
      throw getError(error)
    }
  },
  logout: function() {
      APIEnd.defaults.headers.common['Authorization'] = null
  },
}

