import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Form parsing error' });
    }

    const file = files.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileStream = fs.createReadStream(file.filepath);
    const { data, error } = await supabase.storage
      .from('your-public-bucket')
      .upload(`uploads/${file.originalFilename}`, fileStream, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.mimetype,
      });

    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Upload failed' });
    }

    const { data: publicUrlData } = supabase.storage
      .from('your-public-bucket')
      .getPublicUrl(`uploads/${file.originalFilename}`);

    res.status(200).json({ url: publicUrlData.publicUrl });
  });
}