export interface Family {
  id: string;
  token: string;
  created_at: string;
}

export interface Person {
  id: string;
  family_id: string;
  name: string;
  alias?: string;
  age?: number;
  gender?: 'M' | 'F';
  photo_url?: string;
  created_at: string;
}

export interface Relationship {
  id: string;
  family_id: string;
  person_a: string;
  person_b: string;
  relation_type: 'parent' | 'spouse';
  created_at: string;
}

export interface FamilyData {
  family: Family;
  persons: Person[];
  relationships: Relationship[];
}

