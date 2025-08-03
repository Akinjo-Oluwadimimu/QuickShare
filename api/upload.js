// /pages/api/upload.js

import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import fs from 'fs';

export const config = { api: { bodyParser: false } };

// Use public anon key for client-side interactions
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const form = new formidable.IncomingForm({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err || !files.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const file = files.file;
    const fileStream = fs.createReadStream(file.filepath);
    const fileName = `files/${Date.now()}-${file.originalFilename}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(fileName, fileStream, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Get public URL
    const { data: publicData } = supabase.storage
      .from('uploads')
      .getPublicUrl(fileName);

    return res.status(200).json({
      name: file.originalFilename,
      url: publicData.publicUrl,
    });
  });
}
