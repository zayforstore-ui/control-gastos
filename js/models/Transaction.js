class Transaction {
  constructor({ type, amount, description, category, date }) {
    this.id = self.crypto.randomUUID();
    this.type = type;
    this.amount = Number(amount);
    this.description = description.trim();
    this.category = category;
    this.date = date;
    this.createdAt = new Date().toISOString();
  }
}
