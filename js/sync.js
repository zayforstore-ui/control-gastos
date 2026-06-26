const Sync = {
  _key: 'cg-sync-url',

  getUrl() {
    return localStorage.getItem(this._key) || ''
  },

  setUrl(url) {
    if (url) localStorage.setItem(this._key, url)
    else localStorage.removeItem(this._key)
  },

  isConnected() {
    return !!this.getUrl()
  },

  async testConnection() {
    const url = this.getUrl()
    if (!url) throw new Error('No hay URL configurada')
    const res = await fetch(url)
    if (!res.ok) throw new Error('Error HTTP ' + res.status)
    const data = await res.json()
    return Array.isArray(data)
  },

  async _fetch(body) {
    const url = this.getUrl()
    if (!url) throw new Error('No hay URL configurada')
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error('Error HTTP ' + res.status)
    return res.json()
  },

  async pushAll() {
    const transactions = Storage.getAll()
    await this._fetch({ action: 'replace', data: transactions })
    return transactions.length
  },

  async pullAll() {
    const url = this.getUrl()
    if (!url) throw new Error('No hay URL configurada')
    const res = await fetch(url)
    if (!res.ok) throw new Error('Error HTTP ' + res.status)
    const data = await res.json()
    if (!Array.isArray(data)) throw new Error('Respuesta inválida')
    Storage._setData(data)
    return data.length
  },

  async addTransaction(tx) {
    await this._fetch({ action: 'add', transaction: tx })
  },

  async deleteTransaction(id) {
    await this._fetch({ action: 'delete', id })
  },
}
