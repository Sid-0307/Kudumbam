import { Request, Response } from 'express';
import { PersonService } from '../services/personService';

export class PersonController {
  static async createPerson(req: Request, res: Response) {
    try {
      const { familyToken } = req.body;
      const { name, alias, age, gender, photo_url } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      const person = await PersonService.createPerson(familyToken, {
        name,
        alias,
        age,
        gender,
        photo_url,
      });

      res.status(201).json(person);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updatePerson(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { familyToken, ...updateData } = req.body;

      const person = await PersonService.updatePerson(id, familyToken, updateData);
      res.json(person);
    } catch (error: any) {
      if (error.message === 'Person not found' || error.message === 'Unauthorized') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }

  static async deletePerson(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { familyToken } = req.body;

      await PersonService.deletePerson(id, familyToken);
      res.status(204).send();
    } catch (error: any) {
      if (error.message === 'Person not found' || error.message === 'Unauthorized') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }
}

