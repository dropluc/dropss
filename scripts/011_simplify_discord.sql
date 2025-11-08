-- Remove manual Discord fields and simplify to just connection status
ALTER TABLE profiles DROP COLUMN IF EXISTS discord_username;
ALTER TABLE profiles DROP COLUMN IF EXISTS discord_avatar;
ALTER TABLE profiles DROP COLUMN IF EXISTS discord_status;
ALTER TABLE profiles DROP COLUMN IF EXISTS discord_activity_type;
ALTER TABLE profiles DROP COLUMN IF EXISTS discord_activity_name;
ALTER TABLE profiles DROP COLUMN IF EXISTS discord_activity_details;
ALTER TABLE profiles DROP COLUMN IF EXISTS discord_activity_icon_url;

-- Add new simplified Discord connection fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS discord_user_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS discord_access_token TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS discord_refresh_token TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS discord_connected_at TIMESTAMP WITH TIME ZONE;
