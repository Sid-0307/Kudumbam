import { Node, Edge } from 'reactflow';
import { Person, Relationship } from '../types';
import { RelationLabel } from './relationEngine';

export interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

export function buildGraphData(
  persons: Person[],
  relationships: Relationship[],
  rootId: string | null,
  relationMap: Map<string, RelationLabel>
): GraphData {
  const nodes: Node[] = persons.map((person) => {
    const relation = rootId ? relationMap.get(person.id) || 'self' : 'self';
    const label = getRelationLabel(relation);

    return {
      id: person.id,
      type: 'person',
      position: { x: 0, y: 0 },
      data: {
        ...person,
        relationLabel: label,
        isRoot: rootId === person.id,
      },
    };
  });

  const edges: Edge[] = relationships.map((rel) => {
    let label = '';
    if (rootId) {
      const isDirectlyConnectedToRoot = rel.person_a === rootId || rel.person_b === rootId;
      if (!isDirectlyConnectedToRoot) {
        label = rel.relation_type;
        return {
          id: rel.id,
          source: rel.person_a,
          target: rel.person_b,
          label,
          type: 'smoothstep',
          animated: false,
          style: { strokeWidth: 2 },
        };
      }

      const sourceRelation = relationMap.get(rel.person_a);
      const targetRelation = relationMap.get(rel.person_b);

      if (rel.relation_type === 'parent') {
        // Show the specific relationship label from root's perspective
        if (targetRelation === 'self') {
          label = getRelationLabel(sourceRelation || 'parent');
        } else if (sourceRelation === 'self') {
          label = getRelationLabel(targetRelation || 'child');
        } else {
          // For indirect relationships, show the target's relation to root
          label = targetRelation ? getRelationLabel(targetRelation) : '';
        }
      } else if (rel.relation_type === 'spouse') {
        // For spouse relationships, show the specific label
        if (targetRelation === 'self') {
          label = getRelationLabel(sourceRelation || 'spouse');
        } else if (sourceRelation === 'self') {
          label = getRelationLabel(targetRelation || 'spouse');
        } else {
          label = 'spouse';
        }
      }
    } else {
      label = rel.relation_type;
    }

    return {
      id: rel.id,
      source: rel.person_a,
      target: rel.person_b,
      label,
      type: 'smoothstep',
      animated: false,
      style: { strokeWidth: 2 },
    };
  });

  return { nodes, edges };
}

function getRelationLabel(relation: RelationLabel | string): string {
  const labels: Record<string, string> = {
    self: 'You',
    mother: 'Mother',
    father: 'Father',
    son: 'Son',
    daughter: 'Daughter',
    brother: 'Brother',
    sister: 'Sister',
    husband: 'Husband',
    wife: 'Wife',
    grandmother: 'Grandmother',
    grandfather: 'Grandfather',
    grandson: 'Grandson',
    granddaughter: 'Granddaughter',
    uncle: 'Uncle',
    aunt: 'Aunt',
    cousin: 'Cousin',
    nephew: 'Nephew',
    niece: 'Niece',
    'mother-in-law': 'Mother-in-law',
    'father-in-law': 'Father-in-law',
    'brother-in-law': 'Brother-in-law',
    'sister-in-law': 'Sister-in-law',
    'son-in-law': 'Son-in-law',
    'daughter-in-law': 'Daughter-in-law',
    'great-grandmother': 'Great-Grandmother',
    'great-grandfather': 'Great-Grandfather',
    'great-grandson': 'Great-Grandson',
    'great-granddaughter': 'Great-Granddaughter',
    // Fallbacks (when gender is not set)
    parent: 'Parent',
    child: 'Child',
    grandparent: 'Grandparent',
    grandchild: 'Grandchild',
    sibling: 'Sibling',
    spouse: 'Spouse',
    'great-grandparent': 'Great-Grandparent',
    'great-grandchild': 'Great-Grandchild',
    'parent-sibling': 'Aunt/Uncle', // Fallback for uncle/aunt when gender unknown
  };
  return labels[relation] || relation;
}

export function getNodePosition(index: number, total: number): { x: number; y: number } {
  if (total === 1) return { x: 0, y: 0 };

  // Use a grid-like layout for better organization
  const cols = Math.ceil(Math.sqrt(total));
  const row = Math.floor(index / cols);
  const col = index % cols;
  const spacing = 250;
  
  return {
    x: (col - (cols - 1) / 2) * spacing,
    y: (row - (Math.ceil(total / cols) - 1) / 2) * spacing,
  };
}

export function centerNode(nodes: Node[], nodeId: string): { x: number; y: number } {
  const node = nodes.find((n) => n.id === nodeId);
  if (!node) return { x: 0, y: 0 };

  return {
    x: -node.position.x,
    y: -node.position.y,
  };
}

