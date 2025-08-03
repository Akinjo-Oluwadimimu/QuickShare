// pages/api/upload.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST method is allowed' });
  }

  try {
    const { file, filename, contentType } = req.body;

    if (!file || !filename || !contentType) {
      return res.status(400).json({ error: 'Missing required fields: file, filename, contentType' });
    }

    const buffer = Buffer.from(file, 'base64');
    const filePath = `uploads/${Date.now()}-${filename}`;

    const { data, error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(filePath, buffer, {
        contentType,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      return res.status(500).json({ error: uploadError.message });
    }

    const { data: publicUrlData } = supabase.storage
      .from('uploads')
      .getPublicUrl(filePath);

    return res.status(200).json({ url: publicUrlData.publicUrl });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: 'Unexpected error during upload' });
  }
}