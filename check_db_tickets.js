const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.dnbwdmeyohblbdwrsanr:jvRP0EdEQcb7o7qo@aws-0-eu-west-1.pooler.supabase.com:6543/postgres',
});

async function run() {
  await client.connect();
  console.log("Connected, running support tickets migration...");
  
  await client.query(`
    -- 1. Create support_tickets table
    CREATE TABLE IF NOT EXISTS public.support_tickets (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      subject TEXT NOT NULL,
      status TEXT DEFAULT 'open', -- open, closed, resolved
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    -- 2. Create ticket_messages table
    CREATE TABLE IF NOT EXISTS public.ticket_messages (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
      sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      message TEXT NOT NULL,
      is_admin BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    -- Enable RLS
    ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

    -- RLS for support_tickets
    DROP POLICY IF EXISTS "Users can view their own tickets" ON public.support_tickets;
    CREATE POLICY "Users can view their own tickets" ON public.support_tickets 
      FOR SELECT USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can create their own tickets" ON public.support_tickets;
    CREATE POLICY "Users can create their own tickets" ON public.support_tickets 
      FOR INSERT WITH CHECK (auth.uid() = user_id);

    -- RLS for ticket_messages
    DROP POLICY IF EXISTS "Users can view messages for their tickets" ON public.ticket_messages;
    CREATE POLICY "Users can view messages for their tickets" ON public.ticket_messages 
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.support_tickets 
          WHERE support_tickets.id = ticket_messages.ticket_id 
          AND support_tickets.user_id = auth.uid()
        )
      );

    DROP POLICY IF EXISTS "Users can send messages to their tickets" ON public.ticket_messages;
    CREATE POLICY "Users can send messages to their tickets" ON public.ticket_messages 
      FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
          SELECT 1 FROM public.support_tickets 
          WHERE support_tickets.id = ticket_messages.ticket_id 
          AND support_tickets.user_id = auth.uid()
        )
      );

    -- Trigger to update updated_at on ticket_messages insert
    CREATE OR REPLACE FUNCTION update_ticket_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
      UPDATE public.support_tickets 
      SET updated_at = now() 
      WHERE id = NEW.ticket_id;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    DROP TRIGGER IF EXISTS on_message_insert ON public.ticket_messages;
    CREATE TRIGGER on_message_insert
    AFTER INSERT ON public.ticket_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_ticket_timestamp();

    -- RPC for Admin to fetch all tickets
    CREATE OR REPLACE FUNCTION admin_get_all_tickets()
    RETURNS TABLE (
      id UUID,
      user_id UUID,
      subject TEXT,
      status TEXT,
      created_at TIMESTAMPTZ,
      updated_at TIMESTAMPTZ,
      user_name TEXT,
      user_email TEXT
    ) AS $$
    BEGIN
      RETURN QUERY
      SELECT 
        t.id, t.user_id, t.subject, t.status, t.created_at, t.updated_at,
        p.full_name as user_name, p.email as user_email
      FROM public.support_tickets t
      LEFT JOIN public.profiles p ON t.user_id = p.id
      ORDER BY t.updated_at DESC;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- RPC for Admin to reply to a ticket
    CREATE OR REPLACE FUNCTION admin_reply_to_ticket(target_ticket_id UUID, admin_id UUID, reply_text TEXT)
    RETURNS void AS $$
    BEGIN
      INSERT INTO public.ticket_messages (ticket_id, sender_id, message, is_admin)
      VALUES (target_ticket_id, admin_id, reply_text, true);
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    
    -- RPC for Admin to close ticket
    CREATE OR REPLACE FUNCTION admin_close_ticket(target_ticket_id UUID)
    RETURNS void AS $$
    BEGIN
      UPDATE public.support_tickets SET status = 'closed' WHERE id = target_ticket_id;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

  `);

  console.log("Migrations successful!");
  await client.end();
}

run().catch(console.error);
