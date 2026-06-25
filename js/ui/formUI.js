const FormUI = {
  _form: null,
  _toggleBtns: null,
  _categorySelect: null,
  _onSubmit: null,

  init(formId, onSubmit) {
    this._onSubmit = onSubmit;
    this._form = document.getElementById(formId);
    this._toggleBtns = this._form.querySelectorAll('.toggle-btn');
    this._categorySelect = this._form.querySelector('#category');

    this._toggleBtns.forEach(btn => {
      btn.addEventListener('click', () => this._setType(btn.dataset.type));
    });

    this._form.addEventListener('submit', (e) => {
      e.preventDefault();
      this._handleSubmit();
    });

    this._initAmountFormatting();

    this._form.querySelector('#btn-reset').addEventListener('click', () => this.reset());

    this._setType('expense');
    this._setTodayDate();
  },

  _setType(type) {
    this._toggleBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.type === type);
    });
    this._form.querySelector('input[name="type"]').value = type;
    this._populateCategories(type);
  },

  _populateCategories(type) {
    const categories = TransactionService.CATEGORIES[type] || [];
    this._categorySelect.innerHTML = categories.map(c =>
      `<option value="${c}">${TransactionService.CATEGORY_EMOJIS[c] || '📦'} ${c}</option>`
    ).join('');
  },

  _initAmountFormatting() {
    const input = this._form.querySelector('#amount');
    input.addEventListener('input', () => {
      let cursor = input.selectionStart;
      const len = input.value.length;

      let value = input.value.replace(/[^\d,]/g, '');
      let decimal = '';
      const commaIdx = value.indexOf(',');
      if (commaIdx >= 0) {
        decimal = ',' + value.slice(commaIdx + 1).replace(/,/g, '').slice(0, 2);
        value = value.slice(0, commaIdx).replace(/,/g, '');
      } else {
        value = value.replace(/,/g, '');
      }

      const formatted = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      const newValue = formatted + decimal;

      if (newValue !== input.value) {
        const diff = newValue.length - len;
        input.value = newValue;
        input.setSelectionRange(cursor + diff, cursor + diff);
      }
    });
  },

  _parseAmount(raw) {
    return parseFloat(raw.replace(/\./g, '').replace(',', '.'));
  },

  _handleSubmit() {
    const type = this._form.querySelector('input[name="type"]').value;
    const rawAmount = this._form.querySelector('#amount').value;
    const description = this._form.querySelector('#description').value;
    const category = this._form.querySelector('#category').value;
    const date = this._form.querySelector('#date').value;

    const amount = this._parseAmount(rawAmount);

    if (!rawAmount || isNaN(amount) || amount <= 0) {
      this._shakeField('#amount');
      return;
    }
    if (!description || description.trim().length < 2) {
      this._shakeField('#description');
      return;
    }
    if (!date) {
      this._shakeField('#date');
      return;
    }

    this._onSubmit({ type, amount, description, category, date });
    this.reset();
  },

  _shakeField(selector) {
    const el = this._form.querySelector(selector);
    el.style.borderColor = '#fb7185';
    el.classList.add('animate-shake');
    setTimeout(() => {
      el.style.borderColor = '';
      el.classList.remove('animate-shake');
    }, 600);
  },

  _setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    this._form.querySelector('#date').value = today;
  },

  reset() {
    this._form.reset();
    this._form.querySelector('input[name="type"]').value = 'expense';
    this._setType('expense');
    this._setTodayDate();
  }
};
