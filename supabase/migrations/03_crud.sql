-- Add soft delete to cl_clients
ALTER TABLE cl_clients ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ DEFAULT NULL;

-- Enable Supabase Storage Bucket for Logos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('cl_logos', 'cl_logos', true) 
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
CREATE POLICY "Logos are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'cl_logos');

CREATE POLICY "Users can upload their own logo" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'cl_logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own logo" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'cl_logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own logo" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'cl_logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Note: The policies assume files are uploaded strictly adhering to the file-path pattern: 
-- `[USER_UUID]/[FILENAME]` which allows `storage.foldername(name)[1]` to exactly match the authenticated `auth.uid()`.
