const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.dnbwdmeyohblbdwrsanr:jvRP0EdEQcb7o7qo@aws-0-eu-west-1.pooler.supabase.com:6543/postgres',
});

async function run() {
  await client.connect();
  console.log("Connected, running admin migration...");
  
  await client.query(`
    -- 1. Add account_status to profiles
    ALTER TABLE public.profiles 
      ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active';

    -- 2. RPC function to ban/suspend users securely
    CREATE OR REPLACE FUNCTION admin_update_user_status(target_user_id UUID, new_status TEXT)
    RETURNS void AS $$
    BEGIN
      -- Update profile status
      UPDATE public.profiles
      SET account_status = new_status
      WHERE id = target_user_id;

      -- If banned/suspended, also pause all their active listings
      IF new_status = 'banned' OR new_status = 'suspended' THEN
        UPDATE public.listings
        SET status = 'paused'
        WHERE owner_id = target_user_id AND status = 'active';
      END IF;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `);

  console.log("Checking favorites table...");
  const favRes = await client.query('SELECT * FROM favorites');
  console.log("Favorites currently in DB:", favRes.rows);
  
  console.log("Migrations successful!");
  await client.end();
}

run().catch(console.error);
