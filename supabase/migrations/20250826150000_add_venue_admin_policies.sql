-- Add DELETE and UPDATE policies for venues table to allow admin operations

-- Allow authenticated users to update venues (you may want to restrict this further to admin only)
CREATE POLICY "Authenticated users can update venues" ON venues
FOR UPDATE TO public
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to delete venues (you may want to restrict this further to admin only)
CREATE POLICY "Authenticated users can delete venues" ON venues
FOR DELETE TO public
USING (auth.uid() IS NOT NULL);