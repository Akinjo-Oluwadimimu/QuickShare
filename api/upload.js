import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import fs from 'fs';

export const config = { api: { bodyParser: false } };

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const form = formidable({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err || !files.file) return res.status(400).json({ error: 'No file uploaded.' });

    const f = files.file;
    const fileStream = fs.createReadStream(f.filepath);
    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(`files/${Date.now()}-${f.originalFilename}`, fileStream);

    if (error) return res.status(500).json({ error: error.message });

    const publicUrl = supabase.storage
      .from('uploads')
      .getPublicUrl(data.path).publicUrl;

    return res.status(200).json({ url: publicUrl, name: f.originalFilename });
  });
}
