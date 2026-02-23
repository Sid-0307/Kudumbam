import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../db/client';
import { Person } from '../types';
import { FamilyService } from './familyService';

export class PersonService {
  static async createPerson(
    familyToken: string,
    data: Omit<Person, 'id' | 'family_id' | 'created_at'>
  ): Promise<Person> {
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

    const person: Omit<Person, 'id' | 'created_at'> = {
      id: uuidv4(),
      family_id: family.id,
      name: data.name,
      alias: data.alias,
      age: data.age,
      gender: data.gender,
      photo_url: data.photo_url,
      created_at: new Date().toISOString(),
    };

    const { data: inserted, error } = await supabase
      .from('persons')
      .insert(person)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create person: ${error.message}`);
    }

    return inserted as Person;
  }

  static async updatePerson(
    id: string,
    familyToken: string,
    data: Partial<Omit<Person, 'id' | 'family_id' | 'created_at'>>
  ): Promise<Person> {
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

    // Verify person belongs to family
    const { data: person, error: fetchError } = await supabase
      .from('persons')
      .select('*')
      .eq('id', id)
      .eq('family_id', family.id)
      .single();

    if (fetchError || !person) {
      throw new Error('Person not found');
    }

    const { data: updated, error } = await supabase
      .from('persons')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update person: ${error.message}`);
    }

    return updated as Person;
  }

  static async deletePerson(id: string, familyToken: string): Promise<void> {
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

    // Verify person belongs to family
    const { data: person, error: fetchError } = await supabase
      .from('persons')
      .select('*')
      .eq('id', id)
      .eq('family_id', family.id)
      .single();

    if (fetchError || !person) {
      throw new Error('Person not found');
    }

    const { error } = await supabase
      .from('persons')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete person: ${error.message}`);
    }
  }
}

