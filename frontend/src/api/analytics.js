import client from './client'

export const analyticsApi = {
  dashboard:         (params) => client.get('/analytics/dashboard', { params }),
  trends:            (params) => client.get('/analytics/trends', { params }),
  categoryBreakdown: (params) => client.get('/analytics/category-breakdown', { params }),
  export:            (params) => client.get('/analytics/export', { params, responseType: 'blob' }),
}
