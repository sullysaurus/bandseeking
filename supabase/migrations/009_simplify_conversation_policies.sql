-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view participants of their conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can add participants to conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can invite others to existing conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can update their own participation" ON conversation_participants;

-- Create single, simple policy for conversation_participants
CREATE POLICY "Users can manage their conversation participation" ON conversation_participants
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create a separate policy for viewing other participants (no recursion)
CREATE POLICY "Users can view other participants" ON conversation_participants
  FOR SELECT USING (
    conversation_id IN (
      SELECT cp2.conversation_id 
      FROM conversation_participants cp2 
      WHERE cp2.user_id = auth.uid()
    )
  );