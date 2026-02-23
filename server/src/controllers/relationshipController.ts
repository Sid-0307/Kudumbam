import { Request, Response } from 'express';
import { RelationshipService } from '../services/relationshipService';

export class RelationshipController {
  static async createRelationship(req: Request, res: Response) {
    try {
      const { familyToken, person_a, person_b, relation_type } = req.body;

      if (!person_a || !person_b || !relation_type) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      if (!['parent', 'spouse'].includes(relation_type)) {
        return res.status(400).json({ error: 'Invalid relation_type' });
      }

      const relationship = await RelationshipService.createRelationship(familyToken, {
        person_a,
        person_b,
        relation_type,
      });

      res.status(201).json(relationship);
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        return res.status(409).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }

  static async deleteRelationship(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { familyToken } = req.body;

      await RelationshipService.deleteRelationship(id, familyToken);
      res.status(204).send();
    } catch (error: any) {
      if (error.message === 'Relationship not found' || error.message === 'Unauthorized') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }
}

