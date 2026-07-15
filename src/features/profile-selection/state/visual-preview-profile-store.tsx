'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// TEMPORARY_VISUAL_PREVIEW_STATE — REPLACE WITH SERVER PERSISTENCE IN THE DATA FOUNDATION PHASE

interface VisualPreviewState {
  selectedPersonaId: string | null;
  childName: string | null;
  visualPreviewMode: boolean;
}

interface VisualPreviewContextType {
  state: VisualPreviewState;
  setPreviewState: (personaId: string, name: string) => void;
  clearPreviewState: () => void;
}

const VisualPreviewContext = createContext<VisualPreviewContextType | undefined>(undefined);

export function VisualPreviewProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<VisualPreviewState>({
    selectedPersonaId: null,
    childName: null,
    visualPreviewMode: false
  });

  const setPreviewState = (personaId: string, name: string) => {
    setState({
      selectedPersonaId: personaId,
      childName: name,
      visualPreviewMode: true
    });
  };

  const clearPreviewState = () => {
    setState({
      selectedPersonaId: null,
      childName: null,
      visualPreviewMode: false
    });
  };

  return (
    <VisualPreviewContext.Provider value={{ state, setPreviewState, clearPreviewState }}>
      {children}
    </VisualPreviewContext.Provider>
  );
}

export function useVisualPreview() {
  const context = useContext(VisualPreviewContext);
  if (context === undefined) {
    throw new Error('useVisualPreview must be used within a VisualPreviewProvider');
  }
  return context;
}
