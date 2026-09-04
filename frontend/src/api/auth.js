import client from './client'

export const authApi = {
  signup: (data)  => client.post('/auth/signup', data),
  login:  (data)  => client.post('/auth/login', data),
  getMe:  ()      => client.get('/auth/me'),
  updateMe: (data) => client.put('/auth/me', data),
}
