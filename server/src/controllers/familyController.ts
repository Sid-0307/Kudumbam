import { Request, Response } from 'express';
import { FamilyService } from '../services/familyService';

export class FamilyController {
  static async createFamily(req: Request, res: Response) {
    try {
      const token = await FamilyService.createFamily();
      res.json({ token });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getFamily(req: Request, res: Response) {
    try {
      const { token } = req.params;
      const familyData = await FamilyService.getFamilyByToken(token);

      if (!familyData) {
        return res.status(404).json({ error: 'Family not found' });
      }

      res.json(familyData);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

