import { createContext, useContext, useState, ReactNode } from 'react';

interface DraftProduct {
  id: string;
  name: string;
  vendor: string;
  price: number;
  category: string;
}

interface DraftRequestContextType {
  draftProducts: DraftProduct[];
  setDraftProducts: (products: DraftProduct[]) => void;
  clearDraftProducts: () => void;
}

const DraftRequestContext = createContext<DraftRequestContextType | undefined>(undefined);

export function DraftRequestProvider({ children }: { children: ReactNode }) {
  const [draftProducts, setDraftProducts] = useState<DraftProduct[]>([]);

  const clearDraftProducts = () => setDraftProducts([]);

  return (
    <DraftRequestContext.Provider value={{ draftProducts, setDraftProducts, clearDraftProducts }}>
      {children}
    </DraftRequestContext.Provider>
  );
}

export function useDraftRequest() {
  const context = useContext(DraftRequestContext);
  if (!context) {
    throw new Error('useDraftRequest must be used within DraftRequestProvider');
  }
  return context;
}
