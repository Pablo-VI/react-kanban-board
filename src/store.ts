// src/store.ts
import { create } from "zustand";
import { supabase } from "./supabase";

export type Card = {
  id: string;
  title: string;
  description?: string;
};

export type Column = {
  id: string;
  title: string;
  cards: Card[];
};

type BoardState = {
  columns: Column[];
  fetchBoard: () => Promise<void>;
  addColumn: (title: string) => Promise<void>;
  addCard: (
    columnId: string,
    title: string,
    description?: string
  ) => Promise<void>;
  editCard: (
    columnId: string,
    cardId: string,
    title: string,
    description?: string
  ) => Promise<void>;
  deleteCard: (columnId: string, cardId: string) => Promise<void>;
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

export const useBoardStore = create<BoardState>((set) => ({
  columns: [],

  fetchBoard: async () => {
    const { data: columnsData, error } = await supabase
      .from("columns")
      .select("id, title, cards ( id, title, description )")
      .order("id", { ascending: true });

    if (error) {
      console.error("Error al cargar el tablero:", error);
      return;
    }
    if (!columnsData) {
      set({ columns: [] });
      return;
    }

    const formattedColumns: Column[] = columnsData.map((col) => ({
      ...col,
      id: col.id.toString(),
      cards: col.cards.map((card) => ({
        ...card,
        id: card.id.toString(),
      })),
    }));
    set({ columns: formattedColumns });
  },

  addColumn: async (title) => {
    const { data, error } = await supabase
      .from("columns")
      .insert({ title: title })
      .select()
      .single();

    if (error || !data) {
      console.error("Error al añadir columna:", error);
      return;
    }

    const newColumn: Column = {
      id: data.id.toString(),
      title: data.title,
      cards: [],
    };
    set((state) => ({ columns: [...state.columns, newColumn] }));
  },

  addCard: async (columnId, title, description) => {
    const { data, error } = await supabase
      .from("cards")
      .insert({ title, description, column_id: parseInt(columnId) })
      .select()
      .single();

    if (error || !data) {
      console.error("Error al añadir tarjeta:", error);
      return;
    }

    const newCard: Card = {
      id: data.id.toString(),
      title: data.title,
      description: data.description || undefined,
    };
    set((state) => {
      const newColumns = state.columns.map((col) => {
        if (col.id === columnId) {
          return { ...col, cards: [...col.cards, newCard] };
        }
        return col;
      });
      return { columns: newColumns };
    });
  },

  editCard: async (columnId, cardId, title, description) => {
    const { error } = await supabase
      .from("cards")
      .update({ title, description })
      .eq("id", parseInt(cardId));

    if (error) {
      console.error("Error al editar tarjeta:", error);
      return;
    }

    set((state) => {
      const newColumns = state.columns.map((column) => {
        if (column.id === columnId) {
          const newCards = column.cards.map((card) => {
            if (card.id === cardId) {
              return { ...card, title, description };
            }
            return card;
          });
          return { ...column, cards: newCards };
        }
        return column;
      });
      return { columns: newColumns };
    });
  },

  deleteCard: async (columnId, cardId) => {
    const { error } = await supabase
      .from("cards")
      .delete()
      .eq("id", parseInt(cardId));

    if (error) {
      console.error("Error al borrar tarjeta:", error);
      return;
    }

    set((state) => {
      const newColumns = state.columns.map((col) => {
        if (col.id === columnId) {
          return {
            ...col,
            cards: col.cards.filter((card) => card.id !== cardId),
          };
        }
        return col;
      });
      return { columns: newColumns };
    });
  },

  // Por ahora, estas acciones solo afectan al estado local para mantener la fluidez.
  // Sincronizarlas con el backend es más complejo y un buen siguiente paso.
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
      if (colIndex === -1) return state;
      const column = { ...newColumns[colIndex] };
      const newCards = [...column.cards];
      const [movedCard] = newCards.splice(sourceIndex, 1);
      newCards.splice(destIndex, 0, movedCard);
      newColumns[colIndex] = { ...column, cards: newCards };
      return { columns: newColumns };
    }),
}));
