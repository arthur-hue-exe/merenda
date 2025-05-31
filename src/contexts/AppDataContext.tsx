
"use client";
import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { StockItem, Delivery, ConsumptionRecord } from '@/types';
import { toast } from "@/hooks/use-toast";

interface AppDataContextType {
  stockItems: StockItem[];
  addStockItem: (item: Omit<StockItem, 'id'>) => void;
  updateStockItem: (item: StockItem) => void;
  deleteStockItem: (itemId: string) => void;
  findStockItemById: (itemId: string) => StockItem | undefined;

  deliveries: Delivery[];
  addDelivery: (delivery: Omit<Delivery, 'id'>) => void;
  
  consumptionRecords: ConsumptionRecord[];
  addConsumptionRecord: (record: Omit<ConsumptionRecord, 'id'>) => void;

  studentCount: number;
  setStudentCount: (count: number) => void;

  isLoadingData: boolean;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

const usePersistentState = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, JSON.stringify(state));
    }
  }, [key, state]);

  return [state, setState];
};


export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stockItems, setStockItems] = usePersistentState<StockItem[]>('merendaStockItems', []);
  const [deliveries, setDeliveries] = usePersistentState<Delivery[]>('merendaDeliveries', []);
  const [consumptionRecords, setConsumptionRecords] = usePersistentState<ConsumptionRecord[]>('merendaConsumptionRecords', []);
  const [studentCount, setStudentCount] = usePersistentState<number>('merendaStudentCount', 100);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    // Simulate initial data load
    setIsLoadingData(false);
  }, []);

  const addStockItem = useCallback((item: Omit<StockItem, 'id'>) => {
    const newItem = { ...item, id: crypto.randomUUID() };
    setStockItems(prev => [...prev, newItem]);
    toast({ title: "Item de Estoque Adicionado", description: `${newItem.name} foi adicionado ao estoque.` });
  }, [setStockItems]);

  const updateStockItem = useCallback((updatedItem: StockItem) => {
    setStockItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    toast({ title: "Item de Estoque Atualizado", description: `${updatedItem.name} foi atualizado.` });
  }, [setStockItems]);

  const deleteStockItem = useCallback((itemId: string) => {
    setStockItems(prev => prev.filter(item => item.id !== itemId));
    toast({ title: "Item de Estoque Removido", description: `O item foi removido do estoque.` });
  }, [setStockItems]);

  const findStockItemById = useCallback((itemId: string) => {
    return stockItems.find(item => item.id === itemId);
  }, [stockItems]);

  const addDelivery = useCallback((delivery: Omit<Delivery, 'id'>) => {
    const newDelivery = { ...delivery, id: crypto.randomUUID() };
    setDeliveries(prev => [...prev, newDelivery]);
    // Update stock based on delivery
    newDelivery.items.forEach(deliveredItem => {
      const stockItem = findStockItemById(deliveredItem.itemId);
      if (stockItem) {
        updateStockItem({ ...stockItem, quantity: stockItem.quantity + deliveredItem.quantity });
      } else {
        // Optionally add as a new stock item if it doesn't exist, or handle error
        // For simplicity, we assume items are pre-registered or this is handled by user
        console.warn(`Item ${deliveredItem.itemName} from delivery not found in stock. Consider adding it first.`);
      }
    });
    toast({ title: "Entrega Registrada", description: `Entrega de ${newDelivery.supplier} registrada.` });
  }, [setDeliveries, findStockItemById, updateStockItem]);

  const addConsumptionRecord = useCallback((record: Omit<ConsumptionRecord, 'id'>) => {
    const newRecord = { ...record, id: crypto.randomUUID() };
    let allItemsSufficient = true;
    // Check stock before deducting
    for (const consumedItem of newRecord.items) {
      const stockItem = findStockItemById(consumedItem.itemId);
      if (!stockItem || stockItem.quantity < consumedItem.quantityConsumed) {
        allItemsSufficient = false;
        toast({ title: "Erro de Consumo", description: `Estoque insuficiente para ${consumedItem.itemName}.`, variant: "destructive" });
        break;
      }
    }

    if (allItemsSufficient) {
      setConsumptionRecords(prev => [...prev, newRecord]);
      // Deduct from stock
      newRecord.items.forEach(consumedItem => {
        const stockItem = findStockItemById(consumedItem.itemId);
        if (stockItem) { // Should always be true due to check above
          updateStockItem({ ...stockItem, quantity: stockItem.quantity - consumedItem.quantityConsumed });
        }
      });
      toast({ title: "Consumo Registrado", description: `Consumo para ${newRecord.classOrStudent} registrado.` });
    }
  }, [setConsumptionRecords, findStockItemById, updateStockItem]);

  return (
    <AppDataContext.Provider value={{ 
      stockItems, addStockItem, updateStockItem, deleteStockItem, findStockItemById,
      deliveries, addDelivery,
      consumptionRecords, addConsumptionRecord,
      studentCount, setStudentCount,
      isLoadingData 
    }}>
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = (): AppDataContextType => {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};
