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
  // CAMBIO AQUÍ: Eliminado el parámetro 'columnId' que no se usa
  editCard: (
    cardId: string,
    title: string,
    description?: string
  ) => Promise<void>;
  // CAMBIO AQUÍ: Eliminado el parámetro 'columnId' que no se usa
  deleteCard: (cardId: string) => Promise<void>;
  moveCard: (
    cardId: string,
    sourceColumnId: string,
    destColumnId: string,
    destIndex: number
  ) => Promise<void>;
  reorderCard: (
    columnId: string,
    sourceIndex: number,
    destIndex: number
  ) => Promise<void>;
  // CAMBIO AQUÍ: Añadimos la función interna al tipo para que TS la reconozca
  _updateCardOrders: (
    cardsToUpdate: { id: string; card_order: number; column_id?: number }[]
  ) => Promise<void>;
};

export const useBoardStore = create<BoardState>((set, get) => ({
  columns: [],

  fetchBoard: async () => {
    const { data: columnsData, error } = await supabase
      .from("columns")
      .select("id, title, cards ( id, title, description, card_order )")
      .order("id", { ascending: true })
      .order("card_order", { foreignTable: "cards", ascending: true });

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
    // La lógica de inserción en la base de datos es correcta.
    const { error } = await supabase.from("columns").insert({ title: title });

    if (error) {
      console.error("Error al añadir columna:", error);
    }
  },

  addCard: async (columnId, title, description) => {
    // Checkpoint 2: ¿Llega la llamada hasta el store?
    console.log("2. Función addCard en el store iniciada.");
    console.log("   - Recibido Column ID:", columnId);

    const { columns } = get();
    const targetColumn = columns.find((c) => c.id === columnId);
    if (!targetColumn) {
      console.error(
        "ERROR: No se encontró la columna de destino. La operación se detiene."
      );
      return;
    }

    const newOrder = targetColumn.cards.length;
    const cardToInsert = {
      title,
      description,
      column_id: parseInt(columnId),
      card_order: newOrder,
    };

    // Checkpoint 3: ¿Qué estamos intentando insertar?
    console.log("3. Intentando insertar en Supabase:", cardToInsert);

    const { error } = await supabase.from("cards").insert(cardToInsert);

    // ¡Checkpoint 4: El log MÁS IMPORTANTE! ¿Qué respondió Supabase?
    console.log("4. Respuesta de Supabase a la inserción:", { error });

    if (error) {
      console.error("Error explícito de Supabase al añadir tarjeta:", error);
      return;
    }
  },
  editCard: async (cardId, title, description) => {
    // La lógica de actualización de la base de datos es correcta.
    const { error } = await supabase
      .from("cards")
      .update({ title, description })
      .eq("id", parseInt(cardId));

    if (error) {
      console.error("Error al editar tarjeta:", error);
    }
  },

  deleteCard: async (cardId) => {
    // La lógica de borrado de la base de datos es correcta.
    const { error } = await supabase
      .from("cards")
      .delete()
      .eq("id", parseInt(cardId));

    if (error) {
      console.error("Error al borrar tarjeta:", error);
    }
  },

  // ########## LÓGICA DE MOVIMIENTO ACTUALIZADA ##########

  // Función interna para actualizar el orden de las tarjetas en la BD
  _updateCardOrders: async (
    cardsToUpdate: { id: string; card_order: number; column_id?: number }[]
  ) => {
    if (cardsToUpdate.length === 0) return;

    for (const card of cardsToUpdate) {
      const { error } = await supabase
        .from("cards")
        .update({
          card_order: card.card_order,
          column_id: card.column_id
            ? parseInt(String(card.column_id))
            : undefined,
        })
        .eq("id", parseInt(card.id));

      if (error) {
        console.error("Error al actualizar el orden de una tarjeta:", error);
        break;
      }
    }
  },

  reorderCard: async (columnId, sourceIndex, destIndex) => {
    // 1. Actualización optimista de la UI (la UI se actualiza al instante)
    const originalColumns = get().columns;
    const colIndex = originalColumns.findIndex((col) => col.id === columnId);
    if (colIndex === -1) return;
    const column = { ...originalColumns[colIndex] };
    const newCards = [...column.cards];
    const [movedCard] = newCards.splice(sourceIndex, 1);
    newCards.splice(destIndex, 0, movedCard);
    const updatedColumns = [...originalColumns];
    updatedColumns[colIndex] = { ...column, cards: newCards };
    set({ columns: updatedColumns });

    // 2. Sincronización con la base de datos
    const cardsToUpdate = newCards.map((card, index) => ({
      id: card.id,
      card_order: index,
    }));
    await get()._updateCardOrders(cardsToUpdate);
  },

  moveCard: async (cardId, sourceColumnId, destColumnId, destIndex) => {
    // 1. Actualización optimista de la UI
    const originalColumns = get().columns;
    const newColumns = [...originalColumns];
    const sourceColIndex = newColumns.findIndex(
      (col) => col.id === sourceColumnId
    );
    const destColIndex = newColumns.findIndex((col) => col.id === destColumnId);
    if (sourceColIndex === -1 || destColIndex === -1) return;

    const sourceCol = { ...newColumns[sourceColIndex] };
    const cardIndex = sourceCol.cards.findIndex((card) => card.id === cardId);
    if (cardIndex === -1) return;

    const [movedCard] = sourceCol.cards.splice(cardIndex, 1);
    newColumns[sourceColIndex] = sourceCol;

    const destCol = { ...newColumns[destColIndex] };
    destCol.cards.splice(destIndex, 0, movedCard);
    newColumns[destColIndex] = destCol;

    set({ columns: newColumns });

    // 2. Sincronización con la base de datos
    const sourceCardsToUpdate = newColumns[sourceColIndex].cards.map(
      (card, index) => ({
        id: card.id,
        card_order: index,
      })
    );

    const destCardsToUpdate = newColumns[destColIndex].cards.map(
      (card, index) => ({
        id: card.id,
        card_order: index,
        column_id: parseInt(destColumnId), // Aseguramos que la tarjeta movida tenga la nueva column_id
      })
    );

    // Combinamos y actualizamos todo en una sola llamada
    await get()._updateCardOrders([
      ...sourceCardsToUpdate,
      ...destCardsToUpdate,
    ]);
  },
}));
