-- Add background_image_url column to themes table
ALTER TABLE themes
ADD COLUMN IF NOT EXISTS background_image_url TEXT;

-- Update RLS policies remain the same since they cover all columns
