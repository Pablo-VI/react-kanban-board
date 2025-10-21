// src/store.ts
import { create } from "zustand";

export type Card = {
  id: string;
  title: string;
};

export type Column = {
  id: string;
  title: string;
  cards: Card[];
};

type BoardState = {
  columns: Column[];
  addCard: (columnId: string, title: string) => void;
  deleteCard: (columnId: string, cardId: string) => void;
  moveCard: (
    cardId: string,
    sourceColumnId: string,
    destColumnId: string,
    destIndex: number
  ) => void;
  reorderCard: (
    columnId: string,
    sourceIndex: number,
    destIndex: number
  ) => void;
};

const initialState = {
  columns: [
    {
      id: "todo",
      title: "Por Hacer 📝",
      cards: [
        { id: "1", title: "Revisar diseño de la nueva landing page" },
        { id: "2", title: "Crear componentes de UI básicos" },
      ],
    },
    {
      id: "in-progress",
      title: "En Progreso 👨‍💻",
      cards: [{ id: "3", title: "Implementar autenticación con Supabase" }],
    },
    {
      id: "done",
      title: "Hecho ✅",
      cards: [{ id: "4", title: "Configurar el proyecto con Vite y Tailwind" }],
    },
  ],
};

// Zustand se encarga de combinar el estado inicial con las acciones
export const useBoardStore = create<BoardState>((set) => ({
  ...initialState,

  // Lógica para añadir una nueva tarjeta
  addCard: (columnId, title) =>
    set((state) => {
      const newColumns = [...state.columns];
      const colIndex = newColumns.findIndex((col) => col.id === columnId);

      if (colIndex === -1) return state; // No hacer nada si la columna no existe

      const newCard: Card = {
        id: crypto.randomUUID(), // Genera un ID único
        title: title,
      };

      // Añade la nueva tarjeta a la columna correspondiente
      newColumns[colIndex].cards.push(newCard);

      return { columns: newColumns };
    }),

  deleteCard: (columnId, cardId) =>
    set((state) => {
      const newColumns = [...state.columns];
      const colIndex = newColumns.findIndex((col) => col.id === columnId);

      if (colIndex === -1) return state;

      // Filter out the card to be deleted
      newColumns[colIndex].cards = newColumns[colIndex].cards.filter(
        (card) => card.id !== cardId
      );

      return { columns: newColumns };
    }),

  moveCard: (cardId, sourceColumnId, destColumnId, destIndex) =>
    set((state) => {
      const newColumns = [...state.columns];
      const sourceColIndex = newColumns.findIndex(
        (col) => col.id === sourceColumnId
      );
      const destColIndex = newColumns.findIndex(
        (col) => col.id === destColumnId
      );

      if (sourceColIndex === -1 || destColIndex === -1) return state;

      const sourceCol = { ...newColumns[sourceColIndex] };
      const cardIndex = sourceCol.cards.findIndex((card) => card.id === cardId);

      if (cardIndex === -1) return state;

      const [movedCard] = sourceCol.cards.splice(cardIndex, 1);
      newColumns[sourceColIndex] = sourceCol;

      const destCol = { ...newColumns[destColIndex] };
      destCol.cards.splice(destIndex, 0, movedCard);
      newColumns[destColIndex] = destCol;

      return { columns: newColumns };
    }),

  reorderCard: (columnId, sourceIndex, destIndex) =>
    set((state) => {
      const newColumns = [...state.columns];
      const colIndex = newColumns.findIndex((col) => col.id === columnId);

      if (colIndex === -1) return state; // Columna no encontrada

      const column = { ...newColumns[colIndex] };
      const newCards = [...column.cards];

      // Quita la tarjeta de su posición original
      const [movedCard] = newCards.splice(sourceIndex, 1);
      // Inserta la tarjeta en su nueva posición
      newCards.splice(destIndex, 0, movedCard);

      // Actualiza la columna con el nuevo array de tarjetas
      newColumns[colIndex] = { ...column, cards: newCards };

      return { columns: newColumns };
    }),
}));
