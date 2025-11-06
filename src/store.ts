// src/store.ts
import { create } from "zustand";
import { supabase } from "./supabase";
import { toast } from "react-hot-toast";

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
  addColumn: (title: string) => Promise<boolean>;
  addCard: (
    columnId: string,
    title: string,
    description?: string
  ) => Promise<boolean>;
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
      toast.error("Error al cargar el tablero: " + error.message);
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
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Debes iniciar sesión para añadir una columna.");
      return false;
    }
    const { error } = await supabase
      .from("columns")
      .insert({ title: title, user_id: user.id });

    if (error) {
      toast.error("Error al crear la columna: " + error.message);
      return false;
    }

    toast.success("Columna creada");
    return true;
  },

  addCard: async (columnId, title, description) => {
    const { columns } = get();
    const targetColumn = columns.find((c) => c.id === columnId);
    if (!targetColumn) {
      toast.error("Error: Columna de destino no encontrada.");
      return false;
    }
    const newOrder = targetColumn.cards.length;
    const { error } = await supabase.from("cards").insert({
      title,
      description,
      column_id: parseInt(columnId),
      card_order: newOrder,
    });
    if (error) {
      toast.error("Error al crear la tarjeta: " + error.message);
      return false;
    }
    toast.success("Tarjeta creada");
    return true;
  },

  editCard: async (cardId, title, description) => {
    const { error } = await supabase
      .from("cards")
      .update({ title, description })
      .eq("id", parseInt(cardId));
    if (error) {
      toast.error("Error al guardar la tarjeta: " + error.message);
    } else {
      toast.success("Tarjeta guardada");
    }
  },

  deleteCard: async (cardId) => {
    const { error } = await supabase
      .from("cards")
      .delete()
      .eq("id", parseInt(cardId));
    if (error) {
      toast.error("Error al eliminar la tarjeta: " + error.message);
    } else {
      toast.success("Tarjeta eliminada");
    }
  },

  deleteColumn: async (columnId) => {
    const { error: cardsError } = await supabase
      .from("cards")
      .delete()
      .eq("column_id", parseInt(columnId));
    if (cardsError) {
      toast.error("Error al eliminar las tarjetas: " + cardsError.message);
      return;
    }
    const { error: columnError } = await supabase
      .from("columns")
      .delete()
      .eq("id", parseInt(columnId));
    if (columnError) {
      toast.error("Error al eliminar la columna: " + columnError.message);
    } else {
      toast.success("Columna eliminada");
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
        toast.error("Error al sincronizar el orden.");
        break;
      }
    }
  },

}));
