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

  _handleSubmit() {
    const type = this._form.querySelector('input[name="type"]').value;
    const amount = this._form.querySelector('#amount').value;
    const description = this._form.querySelector('#description').value;
    const category = this._form.querySelector('#category').value;
    const date = this._form.querySelector('#date').value;

    if (!amount || Number(amount) <= 0) {
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
    el.style.borderColor = '#ef4444';
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
