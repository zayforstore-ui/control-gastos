const ChartUI = {
  _chart: null,

  render() {
    if (typeof Chart === 'undefined') return;

    const canvas = document.getElementById('expense-chart');
    if (!canvas) return;

    const transactions = TransactionService.getAll();
    const expenses = transactions.filter(t => t.type === 'expense');

    if (expenses.length === 0) {
      this._destroy();
      return;
    }

    const categories = {};
    for (const t of expenses) {
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    }

    const sorted = Object.entries(categories).sort(([, a], [, b]) => b - a);
    const top = sorted.slice(0, 7);
    const rest = sorted.slice(7);
    if (rest.length > 0) {
      top.push(['Otros', rest.reduce((s, [, v]) => s + v, 0)]);
    }

    this._destroy();

    const ctx = canvas.getContext('2d');
    this._chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: top.map(([n]) => n),
        datasets: [{
          data: top.map(([, v]) => v),
          backgroundColor: this._colors().slice(0, top.length),
          borderColor: '#262626',
          borderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#a3a3a3',
              padding: 14,
              font: { size: 11 },
              usePointStyle: true,
              pointStyleWidth: 10,
            }
          },
          tooltip: {
            backgroundColor: '#404040',
            titleColor: '#f5f5f5',
            bodyColor: '#d4d4d4',
            borderColor: '#525252',
            borderWidth: 1,
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (ctx) => {
                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                const pct = ((ctx.parsed / total) * 100).toFixed(1);
                return ' ' + ctx.label + ': $' + ctx.parsed.toLocaleString('es-CO') + ' (' + pct + '%)';
              }
            }
          }
        }
      }
    });
  },

  _destroy() {
    if (this._chart) {
      this._chart.destroy();
      this._chart = null;
    }
  },

  _colors() {
    return [
      '#10b981', '#f59e0b', '#8b5cf6', '#f97316',
      '#06b6d4', '#ec4899', '#84cc16', '#737373',
    ];
  }
};
