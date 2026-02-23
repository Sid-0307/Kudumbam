import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../db/client';
import { Family, FamilyData } from '../types';

export class FamilyService {
  static async createFamily(): Promise<string> {
    const token = this.generateToken();
    const id = uuidv4();

    const { error } = await supabase
      .from('families')
      .insert({ id, token, created_at: new Date().toISOString() });

    if (error) {
      throw new Error(`Failed to create family: ${error.message}`);
    }

    return token;
  }

  static async getFamilyByToken(token: string): Promise<FamilyData | null> {
    const { data: families, error: familyError } = await supabase
      .from('families')
      .select('*')
      .eq('token', token)
      .single();

    if (familyError || !families) {
      return null;
    }

    const familyId = families.id;

    const { data: persons, error: personsError } = await supabase
      .from('persons')
      .select('*')
      .eq('family_id', familyId)
      .order('created_at', { ascending: true });

    if (personsError) {
      throw new Error(`Failed to fetch persons: ${personsError.message}`);
    }

    const { data: relationships, error: relationshipsError } = await supabase
      .from('relationships')
      .select('*')
      .eq('family_id', familyId);

    if (relationshipsError) {
      throw new Error(`Failed to fetch relationships: ${relationshipsError.message}`);
    }

    return {
      family: families as Family,
      persons: (persons || []) as FamilyData['persons'],
      relationships: (relationships || []) as FamilyData['relationships'],
    };
  }

  static async validateFamilyToken(token: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('families')
      .select('id')
      .eq('token', token)
      .single();

    return !error && !!data;
  }

  private static generateToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }
}

