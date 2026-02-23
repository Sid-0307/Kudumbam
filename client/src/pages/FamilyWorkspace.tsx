import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  Connection,
  NodeTypes,
  ReactFlowProvider,
  ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { apiClient } from '../api/client';
import { Person, Relationship, FamilyData } from '../types';
import { computeRelations } from '../lib/relationEngine';
import { buildGraphData, getNodePosition } from '../lib/graphUtils';
import PersonNode from '../components/PersonNode';
import AddPersonPanel from '../components/AddPersonPanel';
import RelationPanel from '../components/RelationPanel';

const nodeTypes: NodeTypes = {
  person: PersonNode,
};

export default function FamilyWorkspace() {
  const { token } = useParams<{ token: string }>();
  const [familyData, setFamilyData] = useState<FamilyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rootId, setRootId] = useState<string | null>(null);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [showRelationPanel, setShowRelationPanel] = useState(false);
  const [selectedPersons, setSelectedPersons] = useState<string[]>([]);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  const loadFamilyData = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getFamily(token);
      setFamilyData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load family data');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadFamilyData();
  }, [loadFamilyData]);

  // Initial positioning - only run when familyData first loads or persons change
  useEffect(() => {
    if (!familyData) return;

    const relationMap = rootId
      ? computeRelations(rootId, familyData.persons, familyData.relationships)
      : new Map();

    const graphData = buildGraphData(
      familyData.persons,
      familyData.relationships,
      rootId,
      relationMap
    );

    // Only position nodes if we don't have any nodes yet, or if the number of persons changed
    if (nodes.length === 0 || nodes.length !== familyData.persons.length) {
      // Try to load saved positions first
      if (token) {
        apiClient.getLayout(token).then((savedPositions) => {
          if (savedPositions.length > 0) {
            const positionedNodes = graphData.nodes.map((node) => {
              const savedPos = savedPositions.find((p) => p.person_id === node.id);
              if (savedPos) {
                return { ...node, position: { x: savedPos.x, y: savedPos.y } };
              }
              // Fallback to default position if not found
              const nodeIndex = graphData.nodes.findIndex((n) => n.id === node.id);
              return { ...node, position: getNodePosition(nodeIndex, graphData.nodes.length) };
            });
            setNodes(positionedNodes);
          } else {
            // No saved positions, use default layout
            let nodeIndex = 0;
            const positionedNodes = graphData.nodes.map((node) => {
              const pos = getNodePosition(nodeIndex, graphData.nodes.length);
              nodeIndex++;
              return { ...node, position: pos };
            });
            setNodes(positionedNodes);
          }
        }).catch(() => {
          // No saved layout, use default
          let nodeIndex = 0;
          const positionedNodes = graphData.nodes.map((node) => {
            const pos = getNodePosition(nodeIndex, graphData.nodes.length);
            nodeIndex++;
            return { ...node, position: pos };
          });
          setNodes(positionedNodes);
        });
      } else {
        // No token, use default layout
        let nodeIndex = 0;
        const positionedNodes = graphData.nodes.map((node) => {
          const pos = getNodePosition(nodeIndex, graphData.nodes.length);
          nodeIndex++;
          return { ...node, position: pos };
        });
        setNodes(positionedNodes);
      }
    }

    setEdges(graphData.edges);
  }, [familyData?.persons.length, familyData?.relationships.length]);

  // Update relationship labels and edges when rootId changes, but preserve positions
  useEffect(() => {
    if (!familyData || nodes.length === 0) return;

    const relationMap = rootId
      ? computeRelations(rootId, familyData.persons, familyData.relationships)
      : new Map();

    const graphData = buildGraphData(
      familyData.persons,
      familyData.relationships,
      rootId,
      relationMap
    );

    // Update node data (relation labels, isRoot) but preserve positions
    setNodes((currentNodes) =>
      currentNodes.map((existingNode) => {
        const newNode = graphData.nodes.find((n) => n.id === existingNode.id);
        if (newNode) {
          const isSelected = rootId === existingNode.id;
          const personData = newNode.data as Person;
          return {
            ...existingNode,
            data: {
              ...personData,
              relationLabel: newNode.data.relationLabel,
              isRoot: isSelected,
              onEdit: () => {
                setEditingPerson(personData);
                setShowAddPanel(true);
              },
              onDelete: () => {
                handleDeletePerson(existingNode.id);
              },
            },
            selected: isSelected,
          };
        }
        return existingNode;
      })
    );
    setEdges(graphData.edges);
  }, [rootId, familyData?.persons, familyData?.relationships]);

  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      try {
        event.stopPropagation();
        setRootId(node.id);
        setSelectedPersons([node.id]);
        if (node.data) {
          setEditingPerson(node.data as Person);
        }
      } catch (err) {
        console.error('Error handling node click:', err);
      }
    },
    []
  );

  const handlePaneClick = useCallback(() => {
    setSelectedPersons([]);
    setEditingPerson(null);
  }, []);

  const handleAddPerson = async (data: {
    name: string;
    alias?: string;
    age?: number;
    gender?: 'M' | 'F';
    photo_url?: string;
  }) => {
    if (!token || !familyData) return;

    try {
      const newPerson = await apiClient.createPerson({
        familyToken: token,
        ...data,
      });
      await loadFamilyData();
      setShowAddPanel(false);
    } catch (err: any) {
      alert(err.message || 'Failed to add person');
    }
  };

  const handleUpdatePerson = async (data: {
    name?: string;
    alias?: string;
    age?: number;
    gender?: 'M' | 'F';
    photo_url?: string;
  }) => {
    if (!token || !editingPerson) return;

    try {
      await apiClient.updatePerson(editingPerson.id, {
        familyToken: token,
        ...data,
      });
      await loadFamilyData();
      setEditingPerson(null);
    } catch (err: any) {
      alert(err.message || 'Failed to update person');
    }
  };

  const handleDeletePerson = async () => {
    if (!token || !editingPerson) return;

    if (!confirm(`Delete ${editingPerson.name}?`)) return;

    try {
      await apiClient.deletePerson(editingPerson.id, token);
      await loadFamilyData();
      setEditingPerson(null);
      setRootId(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete person');
    }
  };

  const handleCreateRelationship = async (
    personA: string,
    personB: string,
    relationType: 'parent' | 'spouse'
  ) => {
    if (!token) return;

    try {
      await apiClient.createRelationship({
        familyToken: token,
        person_a: personA,
        person_b: personB,
        relation_type: relationType,
      });
      await loadFamilyData();
      setShowRelationPanel(false);
      setSelectedPersons([]);
    } catch (err: any) {
      console.error('Relationship creation error:', err);
      const errorMessage = err?.message || err?.error || 'Failed to create relationship';
      alert(errorMessage);
    }
  };

  const handleSaveLayout = async () => {
    if (!token) return;

    try {
      const positions = nodes.map((node) => ({
        person_id: node.id,
        x: node.position.x,
        y: node.position.y,
      }));

      await apiClient.saveLayout(token, positions);
      alert('Layout saved successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to save layout');
    }
  };

  const handleNodeDoubleClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      const personId = node.id;
      if (selectedPersons.includes(personId)) {
        setSelectedPersons(selectedPersons.filter((id) => id !== personId));
        setShowRelationPanel(false);
      } else if (selectedPersons.length < 2) {
        const newSelection = [...selectedPersons, personId];
        setSelectedPersons(newSelection);
        if (newSelection.length === 2) {
          setShowRelationPanel(true);
        }
      }
    },
    [selectedPersons]
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      // When user drags a connection between two nodes, open the relation panel
      setSelectedPersons([connection.source, connection.target]);
      setShowRelationPanel(true);
    },
    []
  );

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!familyData) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-amber-50/50">
      <div className="bg-white/80 backdrop-blur-sm border-b border-amber-200/50 px-6 py-4 flex items-center justify-between shadow-sm">
        <h1 className="text-2xl font-semibold bg-gradient-to-r from-amber-700 via-orange-700 to-amber-800 bg-clip-text text-transparent">
          Family Tree
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddPanel(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all text-sm font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Add Person
          </button>
          {selectedPersons.length === 2 && (
            <button
              onClick={() => setShowRelationPanel(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all text-sm font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Add Relation
            </button>
          )}
          <button
            onClick={handleSaveLayout}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all text-sm font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Save Layout
          </button>
        </div>
      </div>

      <div className="flex-1 relative">
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={handleConnect}
            onNodeClick={handleNodeClick}
            onNodeDoubleClick={handleNodeDoubleClick}
            onPaneClick={() => {
              handlePaneClick();
              setEditingPerson(null);
            }}
            onInit={(instance) => {
              reactFlowInstance.current = instance;
            }}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.1}
            maxZoom={2}
          >
            <Background color="#fbbf24" gap={20} size={1} opacity={0.1} />
            <Controls 
              className="bg-white/80 backdrop-blur-sm border border-amber-200 rounded-lg shadow-lg"
              style={{ button: { backgroundColor: 'transparent', borderColor: '#fbbf24' } }}
            />
            <MiniMap 
              nodeColor={(node) => {
                if (node.selected || node.data?.isRoot) return '#d97706';
                return '#f59e0b';
              }}
              maskColor="rgba(0, 0, 0, 0.1)"
              className="bg-white/80 backdrop-blur-sm border border-amber-200 rounded-lg shadow-lg"
              pannable={false}
            />
          </ReactFlow>
        </ReactFlowProvider>
      </div>

      {showAddPanel && (
        <AddPersonPanel
          onClose={() => setShowAddPanel(false)}
          onSave={handleAddPerson}
        />
      )}

      {showRelationPanel && selectedPersons.length === 2 && (
        <RelationPanel
          personA={selectedPersons[0]}
          personB={selectedPersons[1]}
          persons={familyData.persons}
          onClose={() => {
            setShowRelationPanel(false);
            setSelectedPersons([]);
          }}
          onSave={handleCreateRelationship}
        />
      )}

      {showAddPanel && editingPerson && (
        <AddPersonPanel
          person={editingPerson}
          onClose={() => {
            setShowAddPanel(false);
            setEditingPerson(null);
          }}
          onSave={async (data) => {
            await handleUpdatePerson(data);
            setShowAddPanel(false);
          }}
          onDelete={handleDeletePerson}
        />
      )}
    </div>
  );
}

