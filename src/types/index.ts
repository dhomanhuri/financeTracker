export interface Category {
  id: string;
  created_at: string;
  name: string;
  type: 'income' | 'expense';
}

export interface Account {
  id: string;
  created_at: string;
  name: string;
  balance: number;
  color: string;
  icon: string;
}

export interface Transaction {
  id: string;
  created_at: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  account_id?: string;
  accounts?: {
    name: string;
    color: string;
  };
}

export type NewTransaction = Omit<Transaction, 'id' | 'created_at'>;
export type NewAccount = Omit<Account, 'id' | 'created_at'>;

export const TRANSACTION_CATEGORIES = {
  expense: [
    'Makanan & Minuman',
    'Transportasi',
    'Belanja',
    'Hiburan',
    'Tagihan',
    'Kesehatan',
    'Pendidikan',
    'Lainnya',
  ],
  income: [
    'Gaji',
    'Bonus',
    'Investasi',
    'Hadiah',
    'Lainnya',
  ],
};
