import { createContext, useContext, useState, ReactNode } from "react";

interface AICompanionContextType {
  isOpen: boolean;
  openAICompanion: () => void;
  closeAICompanion: () => void;
  toggleAICompanion: () => void;
}

const AICompanionContext = createContext<AICompanionContextType | undefined>(undefined);

export function AICompanionProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openAICompanion = () => setIsOpen(true);
  const closeAICompanion = () => setIsOpen(false);
  const toggleAICompanion = () => setIsOpen((prev) => !prev);

  return (
    <AICompanionContext.Provider
      value={{
        isOpen,
        openAICompanion,
        closeAICompanion,
        toggleAICompanion,
      }}
    >
      {children}
    </AICompanionContext.Provider>
  );
}

export function useAICompanion() {
  const context = useContext(AICompanionContext);
  if (!context) {
    throw new Error("useAICompanion must be used within an AICompanionProvider");
  }
  return context;
}
