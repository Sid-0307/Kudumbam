import { supabase } from '../db/client';
import { NodePosition } from '../types';
import { FamilyService } from './familyService';

export class LayoutService {
  static async saveLayout(
    familyToken: string,
    positions: NodePosition[]
  ): Promise<void> {
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

    // Delete existing positions for this family
    await supabase
      .from('node_positions')
      .delete()
      .eq('family_id', family.id);

    // Insert new positions
    if (positions.length > 0) {
      const positionsToInsert = positions.map((pos) => ({
        family_id: family.id,
        person_id: pos.person_id,
        x: pos.x,
        y: pos.y,
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('node_positions')
        .insert(positionsToInsert);

      if (error) {
        throw new Error(`Failed to save layout: ${error.message}`);
      }
    }
  }

  static async getLayout(familyToken: string): Promise<NodePosition[]> {
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

    const { data, error } = await supabase
      .from('node_positions')
      .select('person_id, x, y')
      .eq('family_id', family.id);

    if (error) {
      throw new Error(`Failed to load layout: ${error.message}`);
    }

    return (data || []).map((pos) => ({
      person_id: pos.person_id,
      x: pos.x,
      y: pos.y,
    }));
  }
}

