// Client-side API helper — pengganti supabase client di browser

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

// ── Transactions ──────────────────────────────────────────────────────────────
export const getTransactions = (params?: Record<string, string>) => {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiFetch(`/api/v1/transactions${qs}`);
};

export const createTransaction = (data: Record<string, unknown>) =>
  apiFetch('/api/v1/transactions', { method: 'POST', body: JSON.stringify(data) });

export const deleteTransaction = (id: string) =>
  apiFetch(`/api/v1/transactions/${id}`, { method: 'DELETE' });

// ── Accounts ─────────────────────────────────────────────────────────────────
export const getAccounts = () => apiFetch('/api/v1/accounts');

export const createAccount = (data: Record<string, unknown>) =>
  apiFetch('/api/v1/accounts', { method: 'POST', body: JSON.stringify(data) });

export const deleteAccount = (id: string) =>
  apiFetch(`/api/v1/accounts/${id}`, { method: 'DELETE' });

// ── Categories ────────────────────────────────────────────────────────────────
export const getCategories = () => apiFetch('/api/v1/categories');

export const createCategory = (data: Record<string, unknown>) =>
  apiFetch('/api/v1/categories', { method: 'POST', body: JSON.stringify(data) });

export const updateCategory = (id: string, data: Record<string, unknown>) =>
  apiFetch(`/api/v1/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteCategory = (id: string) =>
  apiFetch(`/api/v1/categories/${id}`, { method: 'DELETE' });

// ── Stocks ────────────────────────────────────────────────────────────────────
export const getStocks = () => apiFetch('/api/v1/stocks');

export const createStock = (data: Record<string, unknown>) =>
  apiFetch('/api/v1/stocks', { method: 'POST', body: JSON.stringify(data) });

export const deleteStock = (id: string) =>
  apiFetch(`/api/v1/stocks/${id}`, { method: 'DELETE' });

// ── Financial Freedom ─────────────────────────────────────────────────────────
export const getFinancialFreedom = () => apiFetch('/api/v1/financial-freedom');

export const upsertFinancialFreedom = (data: Record<string, unknown>) =>
  apiFetch('/api/v1/financial-freedom', { method: 'POST', body: JSON.stringify(data) });

// ── Summary ───────────────────────────────────────────────────────────────────
export const getSummary = () => apiFetch('/api/v1/summary');

// ── API Keys ──────────────────────────────────────────────────────────────────
export const getApiKeys = () => apiFetch('/api/v1/api-keys');

export const createApiKey = (name: string) =>
  apiFetch('/api/v1/api-keys', { method: 'POST', body: JSON.stringify({ name }) });

export const deleteApiKey = (id: string) =>
  apiFetch(`/api/v1/api-keys/${id}`, { method: 'DELETE' });
