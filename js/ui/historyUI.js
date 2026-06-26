const HistoryUI = {
  _el: null,
  _onDelete: null,
  _filters: { months: 'all', type: 'all', category: 'all' },

  init(id, onDelete) {
    this._el = document.getElementById(id);
    this._onDelete = onDelete;
    this._el.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-delete-id]');
      if (btn && confirm('¿Eliminar este movimiento?')) {
        this._onDelete(btn.dataset.deleteId);
      }
    });
  },

  render() {
    const filters = this._filters;
    const hasFilters = filters.months !== 'all' || filters.type !== 'all' || filters.category !== 'all';
    const grouped = TransactionService.getFilteredGroupedByDate(filters);
    const dates = Object.keys(grouped).sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));

    let filterBar = this._buildFilterBar(filters, hasFilters);

    if (dates.length === 0) {
      this._el.innerHTML = filterBar + `
        <div class="flex flex-col items-center justify-center py-12 text-neutral-500">
          <span class="text-5xl mb-3">🔍</span>
          <p class="text-base font-medium mb-1">${hasFilters ? 'Sin resultados' : 'Sin movimientos'}</p>
          <p class="text-sm">${hasFilters ? 'Prueba con otros filtros' : 'Registra tu primer ingreso o gasto'}</p>
        </div>
      `;
      return;
    }

    const formatDateLabel = (dateStr) => {
      const parts = dateStr.split('-');
      const d = new Date(+parts[0], +parts[1] - 1, +parts[2]);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (d.toDateString() === today.toDateString()) return 'Hoy';
      if (d.toDateString() === yesterday.toDateString()) return 'Ayer';
      return d.toLocaleDateString('es-CO', {
        weekday: 'long', day: 'numeric', month: 'long'
      });
    };

    const fmt = n => '$' + n.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    const emojis = TransactionService.CATEGORY_EMOJIS;

    let listHtml = '';
    for (const date of dates) {
      const items = grouped[date];
      const dayNet = items.reduce((sum, t) =>
        t.type === 'income' ? sum + t.amount : sum - t.amount, 0
      );

      listHtml += `
        <div class="mb-5">
          <div class="flex items-center justify-between px-1 py-2 mb-1">
            <span class="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              ${formatDateLabel(date)}
            </span>
            <span class="text-xs font-medium ${dayNet >= 0 ? 'text-emerald-400' : 'text-rose-400'}">
              ${dayNet >= 0 ? '+' : ''}${fmt(Math.abs(dayNet))}
            </span>
          </div>
          <div class="bg-neutral-700 border border-neutral-600 rounded-2xl divide-y divide-neutral-600/50 overflow-hidden">
            ${items.map(t => `
              <div class="history-item flex items-center gap-3 px-4 py-3.5">
                <span class="text-xl flex-shrink-0 w-8 text-center">${emojis[t.category] || '📦'}</span>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-neutral-100 truncate">${this._escapeHtml(t.description)}</p>
                  <p class="text-xs text-neutral-500">${t.category}</p>
                </div>
                <span class="text-sm font-semibold whitespace-nowrap ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}">
                  ${t.type === 'income' ? '+' : '-'}${fmt(t.amount)}
                </span>
                <button data-delete-id="${t.id}" class="btn-delete p-2 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all" aria-label="Eliminar">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    this._el.innerHTML = filterBar + listHtml;
    this._bindFilterEvents();
  },

  _buildFilterBar(filters, hasFilters) {
    const months = TransactionService.getAvailableMonths();
    const allCats = TransactionService.getAllCategories();
    const monthName = (ym) => {
      const d = new Date(+ym.split('-')[0], +ym.split('-')[1] - 1);
      return d.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
    };

    return `
      <div class="mb-4 space-y-2">
        <div class="grid grid-cols-2 gap-2">
          <select id="filter-month" class="input-field text-sm py-2.5">
            <option value="all">📅 Todos los meses</option>
            ${months.map(m => `<option value="${m}" ${filters.months === m ? 'selected' : ''}>${monthName(m)}</option>`).join('')}
          </select>
          <select id="filter-type" class="input-field text-sm py-2.5">
            <option value="all">📋 Todos</option>
            <option value="income" ${filters.type === 'income' ? 'selected' : ''}>💰 Ingresos</option>
            <option value="expense" ${filters.type === 'expense' ? 'selected' : ''}>💸 Gastos</option>
          </select>
        </div>
        <div class="flex gap-2">
          <select id="filter-category" class="input-field text-sm py-2.5 flex-1">
            <option value="all">🏷️ Todas las categorías</option>
            ${allCats.map(c => `<option value="${c}" ${filters.category === c ? 'selected' : ''}>${TransactionService.CATEGORY_EMOJIS[c] || '📦'} ${c}</option>`).join('')}
          </select>
          <button id="btn-clear-filters" class="px-3.5 py-2.5 rounded-xl bg-neutral-700 border border-neutral-600 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-600 transition-all text-sm font-medium ${hasFilters ? '' : 'opacity-30'}" ${hasFilters ? '' : 'disabled'}>
            ✕
          </button>
        </div>
      </div>
    `;
  },

  _bindFilterEvents() {
    const month = this._el.querySelector('#filter-month');
    const type = this._el.querySelector('#filter-type');
    const category = this._el.querySelector('#filter-category');
    const clear = this._el.querySelector('#btn-clear-filters');

    const onChange = () => {
      this._filters = {
        months: month.value,
        type: type.value,
        category: category.value,
      };
      this.render();
    };

    month.addEventListener('change', onChange);
    type.addEventListener('change', onChange);
    category.addEventListener('change', onChange);

    if (clear) {
      clear.addEventListener('click', () => {
        this._filters = { months: 'all', type: 'all', category: 'all' };
        this.render();
      });
    }
  },

  _escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};
