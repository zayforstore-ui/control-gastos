const SettingsUI = {
  _overlay: null,
  _onClose: null,

  init(overlayId, onClose) {
    this._overlay = document.getElementById(overlayId)
    this._onClose = onClose

    document.getElementById('btn-settings').addEventListener('click', () => this.show())
    document.getElementById('settings-close').addEventListener('click', () => this.hide())
    this._overlay.addEventListener('click', (e) => {
      if (e.target === this._overlay) this.hide()
    })

    document.getElementById('btn-test-sync').addEventListener('click', () => this._test())
    document.getElementById('btn-push-sync').addEventListener('click', () => this._push())
    document.getElementById('btn-pull-sync').addEventListener('click', () => this._pull())
    document.getElementById('btn-export-json').addEventListener('click', () => this._export())
    document.getElementById('btn-import-json').addEventListener('click', () => {
      document.getElementById('import-file-input').click()
    })
    document.getElementById('import-file-input').addEventListener('change', (e) => this._import(e))
  },

  render() {
    const url = Sync.getUrl()
    document.getElementById('sync-url').value = url
    this._updateStatus()
  },

  show() {
    this.render()
    this._overlay.classList.remove('hidden')
  },

  hide() {
    this._overlay.classList.add('hidden')
    if (this._onClose) this._onClose()
  },

  _updateStatus() {
    const el = document.getElementById('sync-status')
    const url = Sync.getUrl()
    if (url) {
      el.innerHTML = `<span class="text-emerald-400 font-medium">✅ Conectado</span>`
    } else {
      el.innerHTML = `<span class="text-neutral-500">— Sin configurar</span>`
    }
  },

  async _test() {
    const input = document.getElementById('sync-url')
    const url = input.value.trim()
    const status = document.getElementById('sync-status')

    if (!url) {
      status.innerHTML = `<span class="text-rose-400">⚠️ Ingresa una URL</span>`
      return
    }

    Sync.setUrl(url)
    status.innerHTML = `<span class="text-neutral-400">Probando conexión...</span>`

    try {
      const ok = await Sync.testConnection()
      if (ok) {
        status.innerHTML = `<span class="text-emerald-400 font-medium">✅ Conexión exitosa</span>`
      } else {
        status.innerHTML = `<span class="text-rose-400">❌ Respuesta inesperada</span>`
      }
    } catch (e) {
      status.innerHTML = `<span class="text-rose-400">❌ Error: ${e.message}</span>`
    }
  },

  async _push() {
    const status = document.getElementById('sync-status')
    if (!Sync.isConnected()) {
      status.innerHTML = `<span class="text-rose-400">⚠️ Configura la URL primero</span>`
      return
    }

    if (!confirm('¿Subir todos los datos locales a Google Sheets?')) return
    status.innerHTML = `<span class="text-neutral-400">Subiendo datos...</span>`

    try {
      const n = await Sync.pushAll()
      status.innerHTML = `<span class="text-emerald-400 font-medium">✅ ${n} registros subidos</span>`
    } catch (e) {
      status.innerHTML = `<span class="text-rose-400">❌ Error: ${e.message}</span>`
    }
  },

  async _pull() {
    const status = document.getElementById('sync-status')
    if (!Sync.isConnected()) {
      status.innerHTML = `<span class="text-rose-400">⚠️ Configura la URL primero</span>`
      return
    }

    if (!confirm('¿Descargar datos de Google Sheets? Se reemplazarán los datos locales.')) return
    status.innerHTML = `<span class="text-neutral-400">Descargando datos...</span>`

    try {
      const n = await Sync.pullAll()
      status.innerHTML = `<span class="text-emerald-400 font-medium">✅ ${n} registros descargados</span>`
      if (this._onClose) this._onClose()
      refresh()
    } catch (e) {
      status.innerHTML = `<span class="text-rose-400">❌ Error: ${e.message}</span>`
    }
  },

  _export() {
    const data = Storage.getAll()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gastos-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  },

  _import(e) {
    const file = e.target.files[0]
    if (!file) return

    if (!confirm('¿Importar datos? Se reemplazarán todos los datos actuales.')) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (!Array.isArray(data)) throw new Error('Formato inválido')
        Storage.clear()
        data.forEach(t => Storage.save(t))
        this.hide()
        refresh()
      } catch (err) {
        alert('Error al importar: ' + err.message)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  },
}
