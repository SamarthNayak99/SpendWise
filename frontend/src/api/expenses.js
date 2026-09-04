import client from './client'

export const expensesApi = {
  list:   (params) => client.get('/expenses', { params }),
  create: (data)   => client.post('/expenses', data),
  get:    (id)     => client.get(`/expenses/${id}`),
  update: (id, data) => client.put(`/expenses/${id}`, data),
  delete: (id)     => client.delete(`/expenses/${id}`),
}
