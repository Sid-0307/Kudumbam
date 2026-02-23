import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../db/client';
import { Relationship } from '../types';
import { FamilyService } from './familyService';

export class RelationshipService {
  static async createRelationship(
    familyToken: string,
    data: Omit<Relationship, 'id' | 'family_id' | 'created_at'>
  ): Promise<Relationship> {
    const isValid = await FamilyService.validateFamilyToken(familyToken);
    if (!isValid) {
      throw new Error('Invalid family token');
    }

    const { data: family } = await supabase
      .from('families')
      .select('id')
      .eq('token', familyToken)
      .single();

    if (!family) {
      throw new Error('Family not found');
    }

    // Check for duplicate
    const { data: existing } = await supabase
      .from('relationships')
      .select('*')
      .eq('family_id', family.id)
      .eq('person_a', data.person_a)
      .eq('person_b', data.person_b)
      .eq('relation_type', data.relation_type)
      .single();

    if (existing) {
      throw new Error('Relationship already exists');
    }

    // Check reverse duplicate for parent relationships
    if (data.relation_type === 'parent') {
      const { data: reverseExisting } = await supabase
        .from('relationships')
        .select('*')
        .eq('family_id', family.id)
        .eq('person_a', data.person_b)
        .eq('person_b', data.person_a)
        .eq('relation_type', 'parent')
        .single();

      if (reverseExisting) {
        throw new Error('Reverse relationship already exists');
      }
    }

    const relationship: Omit<Relationship, 'id' | 'created_at'> = {
      id: uuidv4(),
      family_id: family.id,
      person_a: data.person_a,
      person_b: data.person_b,
      relation_type: data.relation_type,
      created_at: new Date().toISOString(),
    };

    const { data: inserted, error } = await supabase
      .from('relationships')
      .insert(relationship)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create relationship: ${error.message}`);
    }

    return inserted as Relationship;
  }

  static async deleteRelationship(id: string, familyToken: string): Promise<void> {
    const isValid = await FamilyService.validateFamilyToken(familyToken);
    if (!isValid) {
      throw new Error('Invalid family token');
    }

    // Get family ID from token
    const { data: family } = await supabase
      .from('families')
      .select('id')
      .eq('token', familyToken)
      .single();

    if (!family) {
      throw new Error('Family not found');
    }

    // Verify relationship belongs to family
    const { data: relationship, error: fetchError } = await supabase
      .from('relationships')
      .select('*')
      .eq('id', id)
      .eq('family_id', family.id)
      .single();

    if (fetchError || !relationship) {
      throw new Error('Relationship not found');
    }

    const { error } = await supabase
      .from('relationships')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete relationship: ${error.message}`);
    }
  }
}

