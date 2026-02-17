-- Create a table for tracking visitors
CREATE TABLE IF NOT EXISTS visitors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (record their visit)
CREATE POLICY "Enable insert for everyone" ON visitors FOR INSERT WITH CHECK (true);

-- Allow only authenticated admins to view visitors
CREATE POLICY "Enable select for admins" ON visitors FOR SELECT USING (auth.role() = 'authenticated');
