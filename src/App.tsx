// src/App.tsx

/**
 * ÍNDICE DE CONTENIDOS
 * ------------------------------------------------------------------
 * 1. Importaciones
 * 2. Componente Principal App
 * 2.1. Inicialización de Sesión
 * 2.2. Listener de Autenticación (Toast de Bienvenida/Despedida)
 * 3. Componente Board (Tablero Kanban)
 * 3.1. Estado y Referencias
 * 3.2. Sincronización de Datos (Realtime)
 * 3.3. Manejadores de Drag and Drop (DnD)
 * 3.4. Manejadores de Modales (Edición, Borrado)
 * 3.5. Renderizado del Tablero
 * ------------------------------------------------------------------
 */

/* 1. Importaciones */
import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";
import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Column } from "./components/Column";
import { AddColumnForm } from "./components/AddColumnForm";
import { arrayMove } from "@dnd-kit/sortable";
import {
  useBoardStore,
  type Card as CardType,
  type Column as ColumnType,
} from "./store";
import { TaskModal } from "./components/TaskModal";
import { Card } from "./components/Card";
import { AuthPage } from "./components/AuthPage";
import { DeleteConfirmationModal } from "./components/DeleteConfirmationModal";
import type { Session } from "@supabase/supabase-js";
import { Toaster, toast } from "react-hot-toast";

/* 2. Componente Principal App */
function App() {
  const [session, setSession] = useState<Session | null>(null);

  /* 2.1. Inicialización de Sesión */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    /* 2.2. Listener de Autenticación */
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Lógica para mostrar Toasts solo en eventos relevantes (no recargas)
      const loginEvent = sessionStorage.getItem("login_event");
      const hasOAuthHash = window.location.hash.includes("access_token");
      const logoutEvent = sessionStorage.getItem("logout_event");

      // Toast de Bienvenida
      if (
        event === "SIGNED_IN" &&
        session &&
        (loginEvent === "true" || hasOAuthHash)
      ) {
        toast.success(`Bienvenido.`);
        if (loginEvent) sessionStorage.removeItem("login_event");
        if (hasOAuthHash)
          window.history.replaceState(null, "", window.location.pathname);
      }

      // Toast de Despedida
      if (event === "SIGNED_OUT" && logoutEvent === "true") {
        toast.success("Has cerrado sesión. ¡Hasta pronto!");
        sessionStorage.removeItem("logout_event");
      }

      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <Toaster
        position="bottom-right"
        reverseOrder={false}
        toastOptions={{
          style: {
            background: "#333",
            color: "#fff",
          },
        }}
      />
      {/* Renderizado Condicional: Auth o Tablero */}
      {!session ? <AuthPage /> : <Board key={session.user.id} />}
    </>
  );
}

/* 3. Componente Board (Tablero Kanban) */
function Board() {
  /* 3.1. Estado y Referencias */

  // Store de Zustand
  const fetchBoard = useBoardStore((state) => state.fetchBoard);
  const columns = useBoardStore((state) => state.columns);
  const setColumns = useBoardStore((state) => state.setColumns);
  const _updateCardOrders = useBoardStore((state) => state._updateCardOrders);
  const deleteColumn = useBoardStore((state) => state.deleteColumn);
  const renameColumn = useBoardStore((state) => state.renameColumn);

  // Referencia para evitar el "eco" en actualizaciones realtime
  const lastLocalUpdateRef = useRef<number>(0);

  // Estados Locales
  const [originalColumns, setOriginalColumns] = useState(columns); // Backup para rollback en DnD
  const [activeCard, setActiveCard] = useState<
    (CardType & { columnId: string }) | null
  >(null); // Tarjeta siendo arrastrada

  // Estados de Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<CardType | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [columnToDelete, setColumnToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // Carga inicial del tablero
  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  /* 3.2. Sincronización de Datos (Realtime) */
  useEffect(() => {
    const channel = supabase
      .channel("realtime-kanban")
      // Escuchar cambios en tarjetas
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cards" },
        () => {
          // Ignorar eventos recientes provocados por el usuario actual (evita parpadeo)
          if (Date.now() - lastLocalUpdateRef.current < 3000) {
            return;
          }
          fetchBoard();
        }
      )
      // Escuchar cambios en columnas
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "columns" },
        () => {
          if (Date.now() - lastLocalUpdateRef.current < 3000) {
            return;
          }
          fetchBoard();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchBoard]);

  // Configuración de sensores para DnD (Mejora la UX en móviles)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  /* 3.4. Manejadores de Modales */

  const handleOpenEditModal = (task: CardType) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOpenDeleteModal = (columnId: string, columnTitle: string) => {
    setColumnToDelete({ id: columnId, title: columnTitle });
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setColumnToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (columnToDelete) {
      await deleteColumn(columnToDelete.id);
      handleCloseDeleteModal();
    }
  };

  const handleSignOut = async () => {
    sessionStorage.setItem("logout_event", "true");
    const { error } = await supabase.auth.signOut();
    if (error) {
      sessionStorage.removeItem("logout_event");
      toast.error("Error al cerrar sesión: " + error.message);
    }
  };

  /* 3.3. Manejadores de Drag and Drop (DnD) */

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const columnId = active.data.current?.columnId as string;
    const card = columns
      .flatMap((col) => col.cards)
      .find((c) => c.id === active.id);

    if (card && columnId) {
      setActiveCard({ ...card, columnId });
    }
    setOriginalColumns(columns); // Guardar estado original por si hay que cancelar
  };

  // Lógica para mover tarjetas entre columnas mientras se arrastra
  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const isActiveACard = active.data.current?.type === "Card";
    if (!isActiveACard) return;

    const sourceColumnId = active.data.current?.columnId as string;
    const overIsColumn = over.data.current?.type === "Column";
    const destColumnId = overIsColumn
      ? (over.id as string)
      : (over.data.current?.columnId as string);

    if (sourceColumnId === destColumnId) return;

    // Clonar y actualizar estado local optimistamente
    const currentColumns = useBoardStore.getState().columns;
    const newColumns = JSON.parse(
      JSON.stringify(currentColumns)
    ) as ColumnType[];

    const sourceColIndex = newColumns.findIndex((c) => c.id === sourceColumnId);
    const destColIndex = newColumns.findIndex((c) => c.id === destColumnId);

    if (sourceColIndex === -1 || destColIndex === -1) return;

    const sourceCards = newColumns[sourceColIndex].cards;
    const destCards = newColumns[destColIndex].cards;

    const activeCardIndex = sourceCards.findIndex((c) => c.id === activeId);
    if (activeCardIndex === -1) return;

    const [movedCard] = sourceCards.splice(activeCardIndex, 1);
    destCards.push(movedCard);

    setColumns(newColumns);
  }

  // Lógica final al soltar la tarjeta (Persistencia en DB)
  function handleDragEnd(event: DragEndEvent) {
    setActiveCard(null);
    const { active, over } = event;

    if (!over) {
      setColumns(originalColumns); // Revertir si se suelta fuera
      return;
    }

    // Identificar columnas origen y destino
    const sourceColumnId = active.data.current?.columnId as string;
    const overIsColumn = over.data.current?.type === "Column";
    const destColumnId = overIsColumn
      ? (over.id as string)
      : (over.data.current?.columnId as string);
    const activeId = active.id as string;
    const overId = over.id as string;

    const sourceCol = columns.find((c) => c.id === sourceColumnId);
    const destCol = columns.find((c) => c.id === destColumnId);

    if (!sourceCol || !destCol) {
      setColumns(originalColumns);
      return;
    }

    // Calcular índices
    const sourceCardIndex = sourceCol.cards.findIndex((c) => c.id === activeId);
    let destCardIndex;
    if (over.data.current?.type === "Card") {
      destCardIndex = destCol.cards.findIndex((c) => c.id === overId);
    } else {
      destCardIndex = destCol.cards.length;
    }

    // Aplicar movimiento en el estado local
    const newColumns = JSON.parse(JSON.stringify(columns)) as ColumnType[];

    if (sourceColumnId === destColumnId) {
      // Misma columna: Reordenar
      const colIndex = newColumns.findIndex((c) => c.id === sourceColumnId);
      if (sourceCardIndex !== -1 && destCardIndex !== -1) {
        const newCards = arrayMove(
          newColumns[colIndex].cards,
          sourceCardIndex,
          destCardIndex
        );
        newColumns[colIndex] = { ...newColumns[colIndex], cards: newCards };
      }
    } else {
      // Diferente columna: Mover y reordenar
      const sourceColIndex = newColumns.findIndex(
        (c) => c.id === sourceColumnId
      );
      const destColIndex = newColumns.findIndex((c) => c.id === destColumnId);

      if (sourceColIndex !== -1 && sourceCardIndex !== -1) {
        const [movedCard] = newColumns[sourceColIndex].cards.splice(
          sourceCardIndex,
          1
        );
        newColumns[destColIndex].cards.splice(destCardIndex, 0, movedCard);
      }
    }

    setColumns(newColumns);

    // Bloquear actualizaciones realtime externas por un momento
    lastLocalUpdateRef.current = Date.now();

    // Preparar datos para actualización en DB
    const cardsToUpdate: {
      id: string;
      card_order: number;
      column_id: number;
    }[] = [];

    // Recalcular orden en la columna origen
    const updatedSourceCol = newColumns.find((c) => c.id === sourceColumnId)!;
    updatedSourceCol.cards.forEach((card, index) => {
      cardsToUpdate.push({
        id: card.id,
        card_order: index,
        column_id: parseInt(sourceColumnId),
      });
    });

    // Recalcular orden en la columna destino (si es diferente)
    if (sourceColumnId !== destColumnId) {
      const updatedDestCol = newColumns.find((c) => c.id === destColumnId)!;
      updatedDestCol.cards.forEach((card, index) => {
        if (!cardsToUpdate.some((c) => c.id === card.id)) {
          cardsToUpdate.push({
            id: card.id,
            card_order: index,
            column_id: parseInt(destColumnId),
          });
        }
      });
    }

    // Enviar actualización a Supabase
    _updateCardOrders(cardsToUpdate);
  }

  /* 3.5. Renderizado del Tablero */
  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="bg-zinc-950 text-white min-h-screen flex flex-col overflow-hidden">
        {/* Cabecera */}
        <header className="flex items-center justify-between p-8 pb-0 flex-shrink-0">
          <h1 className="text-3xl font-bold">Mi tablero</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={handleSignOut}
              className="border border-zinc-700 
                         hover:bg-red-700 hover:border-transparent 
                         text-white font-bold py-2 px-4 rounded cursor-pointer"
            >
              Cerrar Sesión
            </button>
          </div>
        </header>

        {/* Área principal de columnas */}
        <main className="flex gap-6 items-start flex-grow p-8 pt-8 overflow-x-auto hide-scrollbar">
          {columns.map((column) => (
            <Column
              key={column.id}
              id={column.id}
              title={column.title}
              cards={column.cards}
              onCardClick={handleOpenEditModal}
              overColumnId={null}
              onDeleteColumn={handleOpenDeleteModal}
              onRenameColumn={renameColumn}
            />
          ))}
          <AddColumnForm />
        </main>
      </div>

      {/* Drag Overlay (Tarjeta Flotante) */}
      <DragOverlay>
        {activeCard ? (
          <Card
            card={activeCard}
            isActive={true}
            onClick={() => {}}
            columnId={activeCard.columnId}
          />
        ) : null}
      </DragOverlay>

      {/* Modales */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        task={editingTask}
      />
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        itemName={columnToDelete?.title || ""}
      />
    </DndContext>
  );
}

export default App;
