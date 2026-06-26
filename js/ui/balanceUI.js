const BalanceUI = {
  _el: null,

  init(id) {
    this._el = document.getElementById(id);
  },

  render() {
    const { income, expenses, balance } = TransactionService.getBalance();
    const stats = TransactionService.getStats();

    const fmt = n => '$' + n.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

    this._el.innerHTML = `
      <div class="text-center mb-6 pt-2">
        <p class="text-neutral-400 text-sm mb-1 font-medium">Saldo Disponible</p>
        <p class="balance-number ${balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}">
          ${fmt(balance)}
        </p>
      </div>
      <div class="grid grid-cols-2 gap-3 mb-6">
        <div class="card text-center">
          <p class="text-emerald-400/80 text-xs font-medium mb-1">Ingresos</p>
          <p class="text-xl font-bold text-emerald-400">${fmt(income)}</p>
        </div>
        <div class="card text-center">
          <p class="text-rose-400/80 text-xs font-medium mb-1">Gastos</p>
          <p class="text-xl font-bold text-rose-400">${fmt(expenses)}</p>
        </div>
      </div>
      <div class="card">
        <p class="text-neutral-400 text-xs font-medium mb-3 uppercase tracking-wider">Resumen</p>
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-neutral-400">Transacciones</span>
            <span class="text-neutral-100 font-medium">${stats.total}</span>
          </div>
          ${stats.topCategory ? `
          <div class="flex justify-between text-sm">
            <span class="text-neutral-400">Mayor gasto en</span>
            <span class="text-neutral-100 font-medium">${TransactionService.CATEGORY_EMOJIS[stats.topCategory] || ''} ${stats.topCategory}</span>
          </div>` : ''}
          <div class="flex justify-between text-sm">
            <span class="text-neutral-400">Relación gasto/ingreso</span>
            <span class="text-neutral-100 font-medium">${income > 0 ? Math.round((expenses / income) * 100) + '%' : '—'}</span>
          </div>
        </div>
      </div>
      ${expenses > 0 ? `
      <div class="card mt-4" id="chart-card">
        <p class="text-neutral-400 text-xs font-medium mb-3 uppercase tracking-wider">Distribución de Gastos</p>
        <div class="relative" style="height:220px">
          <canvas id="expense-chart"></canvas>
        </div>
      </div>` : ''}
    `;
  }
};
