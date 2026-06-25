/**
 * Capa de persistencia — LocalStorage
 *
 * Toda interacción con el almacenamiento pasa por aquí.
 * Para migrar a Google Sheets en el futuro, solo hay que
 * reescribir este archivo manteniendo la misma interfaz:
 *   - getAll()
 *   - save(transaction)
 *   - delete(id)
 */

const Storage = {
  _key: 'cg-transactions',

  _getData() {
    try {
      const raw = localStorage.getItem(this._key);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  _setData(transactions) {
    try {
      localStorage.setItem(this._key, JSON.stringify(transactions));
      return true;
    } catch {
      return false;
    }
  },

  getAll() {
    return this._getData();
  },

  save(transaction) {
    const list = this._getData();
    list.push(transaction);
    this._setData(list);
    return transaction;
  },

  delete(id) {
    const list = this._getData().filter(t => t.id !== id);
    this._setData(list);
  },

  clear() {
    localStorage.removeItem(this._key);
  }
};
