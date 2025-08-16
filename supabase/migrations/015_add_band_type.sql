-- Add band_type column to bands table
ALTER TABLE bands ADD COLUMN band_type VARCHAR(100);

-- Create index for better query performance
CREATE INDEX idx_bands_band_type ON bands(band_type);