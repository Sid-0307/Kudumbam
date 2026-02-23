const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (data && typeof data.error === 'string') return data.error;
    if (data && typeof data.message === 'string') return data.message;
    return `Request failed (${response.status})`;
  } catch {
    return `Request failed (${response.status})`;
  }
}

export const apiClient = {
  async createFamily(): Promise<{ token: string }> {
    const response = await fetch(`${API_URL}/api/families`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to create family');
    return response.json();
  },

  async getFamily(token: string): Promise<FamilyData> {
    const response = await fetch(`${API_URL}/api/families/${token}`);
    if (!response.ok) throw new Error('Failed to fetch family');
    return response.json();
  },

  async createPerson(data: {
    familyToken: string;
    name: string;
    alias?: string;
    age?: number;
    gender?: 'M' | 'F';
    photo_url?: string;
  }): Promise<Person> {
    const response = await fetch(`${API_URL}/api/persons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(await readErrorMessage(response));
    return response.json();
  },

  async updatePerson(
    id: string,
    data: {
      familyToken: string;
      name?: string;
      alias?: string;
      age?: number;
      gender?: 'M' | 'F';
      photo_url?: string;
    }
  ): Promise<Person> {
    const response = await fetch(`${API_URL}/api/persons/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(await readErrorMessage(response));
    return response.json();
  },

  async deletePerson(id: string, familyToken: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/persons/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ familyToken }),
    });
    if (!response.ok) throw new Error('Failed to delete person');
  },

  async createRelationship(data: {
    familyToken: string;
    person_a: string;
    person_b: string;
    relation_type: 'parent' | 'spouse';
  }): Promise<Relationship> {
    const response = await fetch(`${API_URL}/api/relationships`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create relationship');
    }
    return response.json();
  },

  async deleteRelationship(id: string, familyToken: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/relationships/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ familyToken }),
    });
    if (!response.ok) throw new Error('Failed to delete relationship');
  },

  async saveLayout(token: string, positions: Array<{ person_id: string; x: number; y: number }>): Promise<void> {
    const response = await fetch(`${API_URL}/api/layout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ familyToken: token, positions }),
    });
    if (!response.ok) throw new Error('Failed to save layout');
  },

  async getLayout(token: string): Promise<Array<{ person_id: string; x: number; y: number }>> {
    const response = await fetch(`${API_URL}/api/layout/${token}`);
    if (!response.ok) throw new Error('Failed to load layout');
    return response.json();
  },
};

import type { FamilyData, Person, Relationship } from '../types';

