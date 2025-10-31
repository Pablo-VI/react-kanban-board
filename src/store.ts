// src/store.ts
import { create } from "zustand";
import { supabase } from "./supabase";

export type Card = {
  id: string;
  title: string;
  description?: string;
  card_order?: number;
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
    cardId: string,
    title: string,
    description?: string
  ) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;
  deleteColumn: (columnId: string) => Promise<void>;
  setColumns: (newColumns: Column[]) => void; // ✨ ADDED: For optimistic UI updates
  _updateCardOrders: (
    cardsToUpdate: { id: string; card_order: number; column_id?: number }[]
  ) => Promise<void>;
};

export const useBoardStore = create<BoardState>((set, get) => ({
  columns: [],

  // ✨ ADDED: Direct state setter for optimistic updates
  setColumns: (newColumns) => set({ columns: newColumns }),

  fetchBoard: async () => {
    // ... (this function remains the same)
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      set({ columns: [] });
      return;
    }

    const { data: columnsData, error } = await supabase
      .from("columns")
      .select("id, title, cards ( id, title, description, card_order )")
      .eq("user_id", user.id)
      .order("id", { ascending: true })
      .order("card_order", { foreignTable: "cards", ascending: true });

    if (error) {
      console.error("Error loading board:", error);
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
    // ... (this function remains the same)
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.error("Error: User must be logged in to add a column.");
      return;
    }
    const { error } = await supabase
      .from("columns")
      .insert({ title: title, user_id: user.id });

    if (error) {
      console.error("Error adding column:", error);
    }
  },

  addCard: async (columnId, title, description) => {
    // ... (this function remains the same)
    const { columns } = get();
    const targetColumn = columns.find((c) => c.id === columnId);
    if (!targetColumn) {
      console.error("Error: Target column not found.");
      return;
    }
    const newOrder = targetColumn.cards.length;
    const { error } = await supabase.from("cards").insert({
      title,
      description,
      column_id: parseInt(columnId),
      card_order: newOrder,
    });
    if (error) {
      console.error("Error adding card:", error);
    }
  },

  editCard: async (cardId, title, description) => {
    // ... (this function remains the same)
    const { error } = await supabase
      .from("cards")
      .update({ title, description })
      .eq("id", parseInt(cardId));
    if (error) {
      console.error("Error editing card:", error);
    }
  },

  deleteCard: async (cardId) => {
    // ... (this function remains the same)
    const { error } = await supabase
      .from("cards")
      .delete()
      .eq("id", parseInt(cardId));
    if (error) {
      console.error("Error deleting card:", error);
    }
  },

  deleteColumn: async (columnId) => {
    // ... (this function remains the same)
    const { error: cardsError } = await supabase
      .from("cards")
      .delete()
      .eq("column_id", parseInt(columnId));
    if (cardsError) {
      console.error("Error deleting cards in column:", cardsError);
      return;
    }
    const { error: columnError } = await supabase
      .from("columns")
      .delete()
      .eq("id", parseInt(columnId));
    if (columnError) {
      console.error("Error deleting column:", columnError);
    }
  },

  _updateCardOrders: async (
    cardsToUpdate: { id: string; card_order: number; column_id?: number }[]
  ) => {
    // ... (this function remains the same and is now more important)
    if (cardsToUpdate.length === 0) return;
    for (const card of cardsToUpdate) {
      const updateData: { card_order: number; column_id?: number } = {
        card_order: card.card_order,
      };
      if (card.column_id !== undefined) {
        updateData.column_id = card.column_id;
      }
      const { error } = await supabase
        .from("cards")
        .update(updateData)
        .eq("id", parseInt(card.id));

      if (error) {
        console.error("Error updating card order:", error);
        // We stop on the first error to avoid inconsistent states.
        // Consider a more robust transaction-based approach for production.
        break;
      }
    }
  },

  // ❌ REMOVED `reorderCard` and `moveCard` as their logic is now in the component.
}));
