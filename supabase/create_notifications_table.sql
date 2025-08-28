-- Create notifications table for messages and profile saves
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('message', 'profile_saved', 'new_follower')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  related_message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  related_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Function to create notification for new messages
CREATE OR REPLACE FUNCTION create_message_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Create notification for the receiver
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    related_user_id,
    related_message_id
  )
  SELECT 
    NEW.receiver_id,
    'message',
    'New message from ' || COALESCE(p.username, 'someone'),
    'You have a new message!',
    NEW.sender_id,
    NEW.id
  FROM profiles p
  WHERE p.user_id = NEW.sender_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for message notifications
CREATE TRIGGER trigger_message_notification
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION create_message_notification();

-- Function to create notification for profile saves
CREATE OR REPLACE FUNCTION create_profile_save_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Create notification for the profile owner
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    related_user_id,
    related_profile_id
  )
  SELECT 
    p.user_id,
    'profile_saved',
    COALESCE(saver.username, 'Someone') || ' saved your profile!',
    'Your profile was added to their favorites.',
    NEW.user_id,
    NEW.saved_profile_id
  FROM profiles p
  LEFT JOIN profiles saver ON saver.user_id = NEW.user_id
  WHERE p.id = NEW.saved_profile_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for profile save notifications
CREATE TRIGGER trigger_profile_save_notification
  AFTER INSERT ON saved_profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_save_notification();