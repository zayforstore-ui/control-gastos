(function () {
  'use strict';

  function init() {
    BalanceUI.init('balance-tab');
    FormUI.init('transaction-form', (data) => {
      const tx = TransactionService.add(data);
      refresh();
      if (Sync.isConnected()) Sync.addTransaction(tx).catch(() => {});
    });
    HistoryUI.init('history-tab', (id) => {
      TransactionService.delete(id);
      refresh();
      if (Sync.isConnected()) Sync.deleteTransaction(id).catch(() => {});
    });

    SettingsUI.init('settings-overlay', () => refresh());
    initTabs();
    refresh();
  }

  function initTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = {
      balance: document.getElementById('balance-tab'),
      form: document.getElementById('form-tab'),
      history: document.getElementById('history-tab'),
    };

    tabs.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        tabs.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        Object.entries(contents).forEach(([key, el]) => {
          el.classList.toggle('active', key === tab);
        });
        if (tab === 'history') HistoryUI.render();
      });
    });
  }

  function refresh() {
    BalanceUI.render();
    ChartUI.render();
    HistoryUI.render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
