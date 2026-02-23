import { Request, Response } from 'express';
import { LayoutService } from '../services/layoutService';
import { NodePosition } from '../types';

export class LayoutController {
  static async saveLayout(req: Request, res: Response) {
    try {
      const { familyToken, positions } = req.body;

      if (!familyToken || !positions || !Array.isArray(positions)) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      await LayoutService.saveLayout(familyToken, positions);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getLayout(req: Request, res: Response) {
    try {
      const { token } = req.params;
      const positions = await LayoutService.getLayout(token);
      res.json(positions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

