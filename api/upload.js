// pages/api/upload.js
import formidable from 'formidable';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

export const config = {
  api: {
    bodyParser: false, // required for formidable
  },
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // You need the service role key here!
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new formidable.IncomingForm({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err || !files.file) {
      return res.status(400).json({ error: 'File upload error' });
    }

    const file = files.file[0] ?? files.file; // support both array and single file
    const fileBuffer = fs.readFileSync(file.filepath);
    const filePath = `uploads/${Date.now()}-${file.originalFilename}`;

    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(filePath, fileBuffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const { data: publicData } = supabase.storage
      .from('uploads')
      .getPublicUrl(filePath);

    return res.status(200).json({ url: publicData.publicUrl });
  });
}