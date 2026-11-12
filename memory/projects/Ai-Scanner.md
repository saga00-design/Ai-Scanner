# Ai-Scanner

**Repo:** saga00-design/Ai-Scanner  
**Inspected:** 2026-11-12  
**Status:** Active — AI Studio-originated app, production-capable

## What It Is
A mobile-first React PWA for scanning food/drink/liquor bottles and barcodes. Gemini vision AI identifies the product, specs, price range, barcode, and estimates liquid level. Has three modes: single scan analysis, bulk inventory/stock-take that logs to Supabase, and photo enhancement.

## Tech Stack
- React 18 + TypeScript + Vite
- @google/genai (Gemini) for image analysis
- @supabase/supabase-js for inventory persistence
- lucide-react for icons
- Tailwind CSS (dark slate/amber/emerald theme)
- Camera API (via metadata.json requestFramePermissions)

## File Structure
```
App.tsx                     Root — view mode router, all state
types.ts                    ScanResult, StockItem, ViewMode, ImageState
components/
  ImageUploader.tsx         Camera/file input, single + multi-file (max 10)
  ScanResults.tsx           Scanner mode: product card, specs, price, recipes
  StockTake.tsx             Inventory list — edit qty/cost, delete, clear all
  EnhanceView.tsx           AI photo enhancement (separate flow)
  LiquidLevelGauge.tsx      Visual % fill indicator
services/
  geminiService.ts          analyzeBottleImage() → ScanResult; resizeImage() helper
  supabase.ts               Supabase client + stockService (getAllItems, addItem, updateItem, deleteItem, clearAll)
metadata.json               App name + camera permission request
```

## ScanResult Type (from geminiService)
```ts
{
  productName: string
  specs: { volume: string }
  liquidAnalysis: { percentage: number }
  barcode: string
  averagePrice: string        // e.g. "£30 - £40"
  // + other fields from Gemini
}
```

## StockItem Type
```ts
{
  id: string                 // UUID from Supabase
  productName: string
  volume: string
  percentage: number
  barcode: string
  quantity: number
  cost: number
  image: string              // base64 thumbnail (200px)
}
```

## State Machine (App.tsx)
- `viewMode`: 'scanner' | 'stock' | 'enhance'
- Scanner: scan → show ScanResults, manual reset
- Stock: scan → auto-add to Supabase → auto-reset after 2s delay
- Bulk stock: sequential processing with progress bar
- Error states: DB missing (show SQL), DB connection fail (retry btn)

## Env Vars
```
GEMINI_API_KEY=          # Required — in .env.local
VITE_SUPABASE_URL=       # Supabase project URL
VITE_SUPABASE_ANON_KEY=  # Supabase anon/public key
```

## Supabase Table Setup
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

## Notes / Risks
- RLS policy is wide-open (`using (true)`) — fine for internal/demo use, needs proper auth-based policy for multi-user production
- Images stored as base64 thumbnails in Supabase text column — will inflate DB size at scale; consider Supabase Storage bucket instead
- Bulk scan processes sequentially (by design) — prevents race conditions but means 10 items × ~3s = ~30s total
- averagePrice parsed via regex (`/\d+(\.\d+)?/g`) — brittle if Gemini format changes
- AI Studio app: https://ai.studio/apps/drive/12J_osmC42UMUlEIWXqYrLJuH5o33wUtM

## Relationship to Other Projects
- Uses same Gemini setup as Backbone-Hub and Backbone-POS
- Could feed stock data into Backbone-Hub's inventory management module
