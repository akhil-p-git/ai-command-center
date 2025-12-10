export const AGENT_GRAPHS: Record<string, { nodes: { id: string; label: string; type: 'start' | 'process' | 'end' }[]; edges: { from: string; to: string }[] }> = {
  doc: {
    nodes: [
      { id: 'start', label: 'START', type: 'start' },
      { id: 'retrieve', label: 'Retrieve Docs', type: 'process' },
      { id: 'generate', label: 'Generate Response', type: 'process' },
      { id: 'end', label: 'END', type: 'end' }
    ],
    edges: [
      { from: 'start', to: 'retrieve' },
      { from: 'retrieve', to: 'generate' },
      { from: 'generate', to: 'end' }
    ]
  },
  incident: {
    nodes: [
      { id: 'start', label: 'START', type: 'start' },
      { id: 'classify', label: 'Classify Incident', type: 'process' },
      { id: 'evaluate', label: 'Evaluate Severity', type: 'process' },
      { id: 'action', label: 'Propose Action', type: 'process' },
      { id: 'end', label: 'END', type: 'end' }
    ],
    edges: [
      { from: 'start', to: 'classify' },
      { from: 'classify', to: 'evaluate' },
      { from: 'evaluate', to: 'action' },
      { from: 'action', to: 'end' }
    ]
  },
  slack: {
    nodes: [
      { id: 'start', label: 'START', type: 'start' },
      { id: 'read', label: 'Read Thread', type: 'process' },
      { id: 'summarize', label: 'Summarize', type: 'process' },
      { id: 'extract', label: 'Extract Items', type: 'process' },
      { id: 'end', label: 'END', type: 'end' }
    ],
    edges: [
      { from: 'start', to: 'read' },
      { from: 'read', to: 'summarize' },
      { from: 'summarize', to: 'extract' },
      { from: 'extract', to: 'end' }
    ]
  }
};

