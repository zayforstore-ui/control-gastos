const TransactionService = {
  CATEGORIES: {
    expense: [
      'Alimentos', 'Transporte', 'Servicios', 'Entretenimiento',
      'Salud', 'Educación', 'Compras', 'Ropa', 'Hogar', 'Otro'
    ],
    income: [
      'Salario', 'Freelance', 'Inversiones', 'Ventas',
      'Regalos', 'Reembolso', 'Otro'
    ]
  },

  CATEGORY_EMOJIS: {
    'Salario': '💼', 'Freelance': '💻', 'Inversiones': '📈',
    'Ventas': '🛍️', 'Regalos': '🎁', 'Reembolso': '🔄',
    'Alimentos': '🍽️', 'Transporte': '🚗', 'Servicios': '💡',
    'Entretenimiento': '🎬', 'Salud': '💊', 'Educación': '📚',
    'Compras': '🛒', 'Ropa': '👕', 'Hogar': '🏠',
    'Otro': '📦'
  },

  add(data) {
    const tx = new Transaction(data);
    Storage.save(tx);
    return tx;
  },

  getAll() {
    return Storage.getAll().sort((a, b) => {
      const dateCmp = new Date(b.date) - new Date(a.date);
      if (dateCmp !== 0) return dateCmp;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  },

  delete(id) {
    Storage.delete(id);
  },

  getBalance() {
    const transactions = Storage.getAll();
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return { income, expenses, balance: income - expenses };
  },

  getGroupedByDate() {
    const transactions = this.getAll();
    const grouped = {};
    for (const t of transactions) {
      if (!grouped[t.date]) grouped[t.date] = [];
      grouped[t.date].push(t);
    }
    return grouped;
  },

  getStats() {
    const transactions = Storage.getAll();
    const total = transactions.length;
    const categories = {};
    for (const t of transactions) {
      if (t.type === 'expense') {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
      }
    }
    const topCategory = Object.entries(categories)
      .sort(([, a], [, b]) => b - a)[0];
    return { total, topCategory: topCategory ? topCategory[0] : null };
  }
};
