# Finance Tracker

Aplikasi pencatat keuangan sederhana yang dibangun menggunakan Next.js dan Supabase.

## Fitur

- Tambah transaksi (Pemasukan/Pengeluaran)
- Lihat riwayat transaksi
- Dashboard ringkasan (Total Saldo, Pemasukan, Pengeluaran)
- Hapus transaksi

## Persiapan Awal (Setup)

### 1. Kloning Repository

```bash
git clone <repository-url>
cd fintrack
npm install
```

### 2. Setup Supabase

1. Buat proyek baru di [Supabase Dashboard](https://supabase.com/dashboard).
2. Pergi ke **SQL Editor** dan jalankan perintah berikut untuk membuat tabel:

```sql
-- Create transactions table
CREATE TABLE public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
    category TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public access (WARNING: For demo only)
CREATE POLICY "Enable all access for public" ON public.transactions
    FOR ALL USING (true) WITH CHECK (true);
```

3. Ambil **Project URL** dan **anon public key** dari **Project Settings > API**.

### 3. Konfigurasi Environment Variables

Buka file `.env.local` dan isi dengan kredensial Supabase Anda:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Menjalankan Aplikasi

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

## REST API

Aplikasi ini sekarang mendukung akses via API dengan autentikasi API Key. Anda dapat mengelola API Key di menu **API Settings** di dalam aplikasi.

### Autentikasi
Gunakan header `x-api-key` pada setiap request:
```bash
x-api-key: ft_your_api_key_here
```

### Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/v1/summary` | Mendapatkan ringkasan saldo dan transaksi terbaru |
| `GET` | `/api/v1/accounts` | Mendapatkan daftar semua akun |
| `GET` | `/api/v1/categories` | Mendapatkan daftar kategori |
| `GET` | `/api/v1/transactions` | Mendapatkan riwayat transaksi |
| `POST` | `/api/v1/transactions` | Membuat transaksi baru |

### Contoh Request (Tambah Transaksi)
```bash
curl -X POST http://localhost:3000/api/v1/transactions \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "amount": 50000,
    "type": "expense",
    "category_id": "uuid-kategori",
    "account_id": "uuid-akun",
    "description": "Makan Siang via API"
  }'
```

> **Catatan Penting**: Agar API dapat berjalan, Anda perlu menambahkan `SUPABASE_SERVICE_ROLE_KEY` ke dalam file `.env.local` Anda. Kunci ini diperlukan untuk memvalidasi API Key secara aman di sisi server.

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Database & Auth Client)
- Lucide React (Icons)
