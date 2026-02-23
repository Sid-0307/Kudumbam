import { Person, Relationship } from '../types';

export type RelationLabel =
  | 'self'
  | 'mother'
  | 'father'
  | 'son'
  | 'daughter'
  | 'brother'
  | 'sister'
  | 'husband'
  | 'wife'
  | 'grandmother'
  | 'grandfather'
  | 'grandson'
  | 'granddaughter'
  | 'uncle'
  | 'aunt'
  | 'cousin'
  | 'nephew'
  | 'niece'
  | 'mother-in-law'
  | 'father-in-law'
  | 'brother-in-law'
  | 'sister-in-law'
  | 'son-in-law'
  | 'daughter-in-law'
  | 'great-grandmother'
  | 'great-grandfather'
  | 'great-grandson'
  | 'great-granddaughter';

interface GraphNode {
  id: string;
  parents: Set<string>;
  children: Set<string>;
  spouses: Set<string>;
  gender?: 'M' | 'F';
}

interface RelationInfo {
  label: RelationLabel;
  generation: number;
  relationType: 'direct' | 'sibling' | 'in-law' | 'cousin';
}

export function computeRelations(
  rootId: string,
  persons: Person[],
  relationships: Relationship[]
): Map<string, RelationLabel> {
  const result = new Map<string, RelationLabel>();
  const graph = buildGraph(persons, relationships);
  const personMap = new Map(persons.map(p => [p.id, p]));

  if (!graph.has(rootId)) {
    return result;
  }

  result.set(rootId, 'self');
  const rootPerson = personMap.get(rootId);
  const rootGender = rootPerson?.gender;

  const visited = new Set<string>();
  const queue: Array<{ id: string; path: string[]; generation: number; relationType: 'direct' | 'sibling' | 'in-law' | 'cousin' }> = [
    { id: rootId, path: [], generation: 0, relationType: 'direct' },
  ];

  visited.add(rootId);

  // BFS to compute all relationships
  while (queue.length > 0) {
    const { id, path, generation, relationType } = queue.shift()!;
    const node = graph.get(id)!;
    const person = personMap.get(id);
    const gender = person?.gender;

    // Process parents
    for (const parentId of node.parents) {
      if (!visited.has(parentId)) {
        visited.add(parentId);
        const parentPerson = personMap.get(parentId);
        const parentGender = parentPerson?.gender;
        
        let label: RelationLabel;
        if (generation === 0) {
          // Direct parent
          label = parentGender === 'F' ? 'mother' : parentGender === 'M' ? 'father' : 'parent';
        } else if (generation === 1) {
          // Grandparent
          label = parentGender === 'F' ? 'grandmother' : parentGender === 'M' ? 'grandfather' : 'grandparent';
        } else if (generation === 2) {
          label = parentGender === 'F' ? 'great-grandmother' : parentGender === 'M' ? 'great-grandfather' : 'great-grandparent';
        } else {
          label = 'parent';
        }
        
        result.set(parentId, label);
        queue.push({
          id: parentId,
          path: [...path, id],
          generation: generation + 1,
          relationType: 'direct',
        });
      }
    }

    // Process children
    for (const childId of node.children) {
      if (!visited.has(childId)) {
        visited.add(childId);
        const childPerson = personMap.get(childId);
        const childGender = childPerson?.gender;
        
        let label: RelationLabel;
        if (generation === 0) {
          // Direct child
          label = childGender === 'M' ? 'son' : childGender === 'F' ? 'daughter' : 'child';
        } else if (generation === -1) {
          // Grandchild
          label = childGender === 'M' ? 'grandson' : childGender === 'F' ? 'granddaughter' : 'grandchild';
        } else if (generation === -2) {
          label = childGender === 'M' ? 'great-grandson' : childGender === 'F' ? 'great-granddaughter' : 'great-grandchild';
        } else {
          label = childGender === 'M' ? 'son' : childGender === 'F' ? 'daughter' : 'child';
        }
        
        result.set(childId, label);
        queue.push({
          id: childId,
          path: [...path, id],
          generation: generation - 1,
          relationType: 'direct',
        });
      }
    }

    // Process spouses
    for (const spouseId of node.spouses) {
      if (!visited.has(spouseId)) {
        visited.add(spouseId);
        const spousePerson = personMap.get(spouseId);
        const spouseGender = spousePerson?.gender;
        
        let label: RelationLabel;
        if (generation === 0) {
          // Direct spouse
          if (rootGender === 'M') {
            label = spouseGender === 'F' ? 'wife' : 'spouse';
          } else if (rootGender === 'F') {
            label = spouseGender === 'M' ? 'husband' : 'spouse';
          } else {
            label = 'spouse';
          }
        } else {
          label = 'spouse';
        }
        
        result.set(spouseId, label);
        queue.push({
          id: spouseId,
          path: [...path, id],
          generation,
          relationType: 'in-law',
        });
      }
    }
  }

  // Second pass: Identify siblings, in-laws, and extended family
  const rootNode = graph.get(rootId)!;
  
  // Siblings
  for (const parentId of rootNode.parents) {
    const parent = graph.get(parentId);
    if (parent) {
      for (const childId of parent.children) {
        if (childId !== rootId && result.has(childId)) {
          const siblingPerson = personMap.get(childId);
          const siblingGender = siblingPerson?.gender;
          const label: RelationLabel = siblingGender === 'M' ? 'brother' : siblingGender === 'F' ? 'sister' : 'sibling';
          result.set(childId, label);
        }
      }
    }
  }

  // In-laws: spouse's parents
  for (const spouseId of rootNode.spouses) {
    const spouseNode = graph.get(spouseId);
    if (spouseNode) {
      for (const parentId of spouseNode.parents) {
        if (result.has(parentId)) {
          const parentPerson = personMap.get(parentId);
          const parentGender = parentPerson?.gender;
          const label: RelationLabel = parentGender === 'F' ? 'mother-in-law' : parentGender === 'M' ? 'father-in-law' : 'parent-in-law';
          result.set(parentId, label);
        }
      }
      
      // Spouse's siblings (brothers/sisters-in-law)
      for (const parentId of spouseNode.parents) {
        const parent = graph.get(parentId);
        if (parent) {
          for (const childId of parent.children) {
            if (childId !== spouseId && result.has(childId)) {
              const siblingPerson = personMap.get(childId);
              const siblingGender = siblingPerson?.gender;
              const label: RelationLabel = siblingGender === 'M' ? 'brother-in-law' : siblingGender === 'F' ? 'sister-in-law' : 'sibling-in-law';
              result.set(childId, label);
            }
          }
        }
      }
    }
  }

  // Children's spouses (sons/daughters-in-law)
  for (const childId of rootNode.children) {
    const childNode = graph.get(childId);
    if (childNode) {
      for (const spouseId of childNode.spouses) {
        if (result.has(spouseId)) {
          const spousePerson = personMap.get(spouseId);
          const spouseGender = spousePerson?.gender;
          const label: RelationLabel = spouseGender === 'F' ? 'daughter-in-law' : spouseGender === 'M' ? 'son-in-law' : 'child-in-law';
          result.set(spouseId, label);
        }
      }
    }
  }

  // Uncles and Aunts (parent's siblings) - must override any previous labels
  for (const parentId of rootNode.parents) {
    const parentNode = graph.get(parentId);
    if (parentNode) {
      for (const grandparentId of parentNode.parents) {
        const grandparent = graph.get(grandparentId);
        if (grandparent) {
          for (const uncleAuntId of grandparent.children) {
            if (uncleAuntId !== parentId) {
              const uncleAuntPerson = personMap.get(uncleAuntId);
              const uncleAuntGender = uncleAuntPerson?.gender;
              const label: RelationLabel = uncleAuntGender === 'M' ? 'uncle' : uncleAuntGender === 'F' ? 'aunt' : 'uncle';
              result.set(uncleAuntId, label);
            }
          }
        }
      }
    }
  }

  // Nieces and Nephews (sibling's children)
  for (const parentId of rootNode.parents) {
    const parent = graph.get(parentId);
    if (parent) {
      for (const siblingId of parent.children) {
        if (siblingId !== rootId) {
          const siblingNode = graph.get(siblingId);
          if (siblingNode) {
            for (const nieceNephewId of siblingNode.children) {
              if (result.has(nieceNephewId)) {
                const nieceNephewPerson = personMap.get(nieceNephewId);
                const nieceNephewGender = nieceNephewPerson?.gender;
                const label: RelationLabel = nieceNephewGender === 'M' ? 'nephew' : nieceNephewGender === 'F' ? 'niece' : 'sibling-child';
                result.set(nieceNephewId, label);
              }
            }
          }
        }
      }
    }
  }

  // Cousins (uncle/aunt's children)
  for (const parentId of rootNode.parents) {
    const parentNode = graph.get(parentId);
    if (parentNode) {
      for (const grandparentId of parentNode.parents) {
        const grandparent = graph.get(grandparentId);
        if (grandparent) {
          for (const uncleAuntId of grandparent.children) {
            if (uncleAuntId !== parentId) {
              const uncleAuntNode = graph.get(uncleAuntId);
              if (uncleAuntNode) {
                for (const cousinId of uncleAuntNode.children) {
                  if (result.has(cousinId)) {
                    result.set(cousinId, 'cousin');
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  return result;
}

function buildGraph(
  persons: Person[],
  relationships: Relationship[]
): Map<string, GraphNode> {
  const graph = new Map<string, GraphNode>();

  // Initialize nodes
  for (const person of persons) {
    graph.set(person.id, {
      id: person.id,
      parents: new Set(),
      children: new Set(),
      spouses: new Set(),
      gender: person.gender,
    });
  }

  // Build relationships
  for (const rel of relationships) {
    const nodeA = graph.get(rel.person_a);
    const nodeB = graph.get(rel.person_b);

    if (!nodeA || !nodeB) continue;

    if (rel.relation_type === 'parent') {
      nodeA.children.add(rel.person_b);
      nodeB.parents.add(rel.person_a);
    } else if (rel.relation_type === 'spouse') {
      nodeA.spouses.add(rel.person_b);
      nodeB.spouses.add(rel.person_a);
    }
  }

  return graph;
}
