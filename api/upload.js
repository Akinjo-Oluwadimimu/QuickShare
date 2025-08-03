import { IncomingForm } from 'formidable';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

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

  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error parsing the form' });
    }

    const file = files.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = file[0].filepath;
    const fileStream = fs.createReadStream(filePath);
    const fileName = file[0].originalFilename;

    const { data, error } = await supabase.storage
      .from('your-public-bucket') // Replace with your bucket name
      .upload(`uploads/${fileName}`, fileStream, {
        cacheControl: '3600',
        upsert: true,
        contentType: file[0].mimetype,
      });

    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Upload to Supabase failed' });
    }

    const { data: publicUrlData } = supabase.storage
      .from('your-public-bucket')
      .getPublicUrl(`uploads/${fileName}`);

    return res.status(200).json({ url: publicUrlData.publicUrl });
  });
}