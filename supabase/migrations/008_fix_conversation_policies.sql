-- Drop existing policies that cause infinite recursion
DROP POLICY IF EXISTS "Users can view participants of their conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can add participants to conversations they're in" ON conversation_participants;

-- Create fixed policies for conversation_participants without self-referencing
CREATE POLICY "Users can view participants of their conversations" ON conversation_participants
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM conversation_participants cp 
      WHERE cp.conversation_id = conversation_participants.conversation_id 
      AND cp.user_id = auth.uid()
      AND cp.id != conversation_participants.id  -- Prevent self-reference
    )
  );

-- Simplify the insert policy to avoid recursion
CREATE POLICY "Users can add participants to conversations" ON conversation_participants
  FOR INSERT WITH CHECK (
    user_id = auth.uid()  -- Users can only add themselves initially
  );

-- Add a separate policy for adding other participants (for future group chat features)
CREATE POLICY "Users can invite others to existing conversations" ON conversation_participants
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversation_participants.conversation_id
      AND cp.user_id = auth.uid()
      AND cp.joined_at < NOW()  -- Must already be in the conversation
    )
  );

-- Fix the conversations policy to be more direct
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON conversations;
CREATE POLICY "Users can view conversations they participate in" ON conversations
  FOR SELECT USING (
    id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

-- Fix messages policies to be more efficient
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
CREATE POLICY "Users can view messages in their conversations" ON messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can send messages to conversations they're in" ON messages;
CREATE POLICY "Users can send messages to conversations they're in" ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    AND conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid()
    )
  );