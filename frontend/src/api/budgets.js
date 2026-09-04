import client from './client'

export const budgetsApi = {
  list:      (params)    => client.get('/budgets', { params }),
  status:    (params)    => client.get('/budgets/status', { params }),
  create:    (data)      => client.post('/budgets', data),
  update:    (id, data)  => client.put(`/budgets/${id}`, data),
  delete:    (id)        => client.delete(`/budgets/${id}`),
}
