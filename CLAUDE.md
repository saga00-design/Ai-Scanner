# Memory

## Me
Elliott — Ai-Scanner is an AI-powered food/drink/liquor inventory scanning app.

## This Repo
Mobile-first React app — scan a bottle or barcode with the camera, Gemini identifies brand/specs/price/liquid level, and optionally logs it to a Supabase stock database.

→ Full details: memory/projects/Ai-Scanner.md

## Three View Modes
| Mode | Purpose |
|------|---------|
| **Scanner** | Single scan — returns product name, specs, price, barcode, liquid % |
| **Stock** | Bulk/daily inventory — scans auto-add to Supabase `stock_items` table |
| **Enhance** | AI photo enhancement (EnhanceView.tsx) |

## Tech Stack
| Layer | Tech |
|-------|------|
| Frontend | React 18 + TypeScript + Vite |
| AI | @google/genai (Gemini) — image analysis |
| DB | Supabase (PostgreSQL via @supabase/supabase-js) |
| Icons | lucide-react |
| Styling | Tailwind (inline classes, dark slate theme) |

## Key Files
| File | Purpose |
|------|---------|
| `App.tsx` | Root — view routing, scan/stock state machine |
| `services/geminiService.ts` | Gemini prompt → structured scan result |
| `services/supabase.ts` | Supabase client + stockService CRUD |
| `components/ScanResults.tsx` | Scanner mode result display |
| `components/StockTake.tsx` | Inventory list with edit/delete |
| `components/ImageUploader.tsx` | Camera/file upload, single + bulk |
| `components/EnhanceView.tsx` | Photo enhancement UI |
| `components/LiquidLevelGauge.tsx` | Visual liquid level indicator |
| `types.ts` | ScanResult, StockItem, ViewMode, ImageState |

## Supabase Setup
Run this SQL in Supabase SQL editor before first use:
```sql
create table if not exists stock_items (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  product_name text not null,
  volume text, percentage integer, barcode text,
  quantity integer default 1, cost numeric, image text
);
alter table stock_items enable row level security;
create policy "Enable access for all users" on stock_items for all using (true) with check (true);
```

## Env Vars Required
- `GEMINI_API_KEY` — in `.env.local`
- Supabase URL + anon key — check `services/supabase.ts`

## Dev Command
```bash
npm run dev
```

## Notes
- Camera permissions requested in `metadata.json`
- Bulk scan processes images sequentially (not parallel) to keep UI smooth
- Images are resized to 200px thumbnails before Supabase storage to save space
- AI Studio app: https://ai.studio/apps/drive/12J_osmC42UMUlEIWXqYrLJuH5o33wUtM

## Preferences
- Direct, practical answers
- Complete code when making changes
- Point out risks before acting
- Small business → scalable thinking
