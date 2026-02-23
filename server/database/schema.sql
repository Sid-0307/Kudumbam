-- Create families table
CREATE TABLE IF NOT EXISTS families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create persons table
CREATE TABLE IF NOT EXISTS persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  alias TEXT,
  age INTEGER,
  gender TEXT CHECK (gender IN ('M', 'F')),
  photo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create relationships table
CREATE TABLE IF NOT EXISTS relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  person_a UUID NOT NULL,
  person_b UUID NOT NULL,
  relation_type TEXT NOT NULL CHECK (relation_type IN ('parent', 'spouse')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create node_positions table for saving graph layout
CREATE TABLE IF NOT EXISTS node_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  x DOUBLE PRECISION NOT NULL,
  y DOUBLE PRECISION NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(family_id, person_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_persons_family_id ON persons(family_id);
CREATE INDEX IF NOT EXISTS idx_relationships_family_id ON relationships(family_id);
CREATE INDEX IF NOT EXISTS idx_relationships_person_a ON relationships(person_a);
CREATE INDEX IF NOT EXISTS idx_relationships_person_b ON relationships(person_b);
CREATE INDEX IF NOT EXISTS idx_families_token ON families(token);
CREATE INDEX IF NOT EXISTS idx_node_positions_family_id ON node_positions(family_id);
CREATE INDEX IF NOT EXISTS idx_node_positions_person_id ON node_positions(person_id);

