const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.dnbwdmeyohblbdwrsanr:jvRP0EdEQcb7o7qo@aws-0-eu-west-1.pooler.supabase.com:6543/postgres',
});

async function run() {
  await client.connect();
  console.log("Connected, running favorites and views migration...");
  
  await client.query(`
    -- 1. Ensure views and favorites columns exist
    ALTER TABLE public.listings 
      ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS favorites INTEGER DEFAULT 0;

    -- 2. Create favorites table
    CREATE TABLE IF NOT EXISTS public.favorites (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE(user_id, listing_id)
    );

    -- Enable RLS
    ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

    -- Create RLS Policies
    DROP POLICY IF EXISTS "Users can view their own favorites" ON public.favorites;
    CREATE POLICY "Users can view their own favorites" ON public.favorites 
      FOR SELECT USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can insert their own favorites" ON public.favorites;
    CREATE POLICY "Users can insert their own favorites" ON public.favorites 
      FOR INSERT WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.favorites;
    CREATE POLICY "Users can delete their own favorites" ON public.favorites 
      FOR DELETE USING (auth.uid() = user_id);

    -- 3. Trigger to keep favorites count synced
    CREATE OR REPLACE FUNCTION update_listing_favorites_count()
    RETURNS TRIGGER AS $$
    BEGIN
      IF TG_OP = 'INSERT' THEN
        UPDATE public.listings SET favorites = favorites + 1 WHERE id = NEW.listing_id;
        RETURN NEW;
      ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.listings SET favorites = favorites - 1 WHERE id = OLD.listing_id;
        RETURN OLD;
      END IF;
      RETURN NULL;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS on_favorite_change ON public.favorites;
    CREATE TRIGGER on_favorite_change
    AFTER INSERT OR DELETE ON public.favorites
    FOR EACH ROW
    EXECUTE FUNCTION update_listing_favorites_count();

    -- 4. RPC function to increment views
    CREATE OR REPLACE FUNCTION increment_listing_views(listing_id UUID)
    RETURNS void AS $$
    BEGIN
      UPDATE public.listings
      SET views = views + 1
      WHERE id = listing_id;
    END;
    $$ LANGUAGE plpgsql;
  `);
  
  console.log("Migrations successful!");
  await client.end();
}

run().catch(console.error);
