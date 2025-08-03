import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  const { data, error } = await supabase.storage
    .from('uploads')
    .list('files', { limit: 100 });

  if (error) return res.status(500).json({ error: error.message });

  const urls = data.map(file => ({
    name: file.name,
    url: supabase.storage
      .from('uploads')
      .getPublicUrl(`files/${file.name}`).publicUrl
  }));
  res.status(200).json(urls);
}
