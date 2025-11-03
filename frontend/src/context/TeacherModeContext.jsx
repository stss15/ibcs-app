import React, { createContext, useState, useContext, useMemo } from 'react';

const TeacherModeContext = createContext();

export const TeacherModeProvider = ({ children }) => {
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [currentPacing, setCurrentPacing] = useState({ unitId: null, lessonId: null });

  const togglePresentationMode = () => {
    setIsPresentationMode(prev => !prev);
  };

  const value = useMemo(() => ({
    isPresentationMode,
    togglePresentationMode,
    currentPacing,
    setCurrentPacing
  }), [isPresentationMode, currentPacing]);

  return (
    <TeacherModeContext.Provider value={value}>
      {children}
    </TeacherModeContext.Provider>
  );
};

export const useTeacherMode = () => {
  const context = useContext(TeacherModeContext);
  if (context === undefined) {
    throw new Error('useTeacherMode must be used within a TeacherModeProvider');
  }
  return context;
};
