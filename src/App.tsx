// src/App.tsx
import { useState, useEffect } from "react";
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
import { useBoardStore, type Card as CardType } from "./store";
import { TaskModal } from "./components/TaskModal";
import { Card } from "./components/Card";
import { AuthPage } from "./components/AuthPage";
import { DeleteConfirmationModal } from "./components/DeleteConfirmationModal";
import type { Session } from "@supabase/supabase-js";

function App() {
  const [session, setSession] = useState<Session | null>(null); // 👈 2. Estado para la sesión

  // 👇 3. Este useEffect gestiona la sesión del usuario
  useEffect(() => {
    // Comprueba la sesión activa al cargar la página
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Escucha los cambios de autenticación (login, logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Limpia la suscripción al desmontar el componente
    return () => subscription.unsubscribe();
  }, []);

  // 🤯 ¡La lógica principal! Muestra AuthPage o el tablero.
  if (!session) {
    return <AuthPage />;
  } else {
    return <Board key={session.user.id} />; // Usamos un componente Board para el tablero
  }
}

// 👇 4. Todo el código de tu tablero ahora vive en este componente
function Board() {
  const fetchBoard = useBoardStore((state) => state.fetchBoard);
  const columns = useBoardStore((state) => state.columns);
  const moveCard = useBoardStore((state) => state.moveCard);
  const reorderCard = useBoardStore((state) => state.reorderCard);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<CardType | null>(null);
  const [targetColumn, setTargetColumn] = useState("");
  const [activeCard, setActiveCard] = useState<
    (CardType & { columnId: string }) | null
  >(null);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);
  const deleteColumn = useBoardStore((state) => state.deleteColumn);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [columnToDelete, setColumnToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  useEffect(() => {
    const channel = supabase
      .channel("realtime-kanban")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cards" },
        () => fetchBoard()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "columns" },
        () => fetchBoard()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchBoard]);

  const handleOpenCreateModal = (columnId: string) => {
    setTargetColumn(columnId);
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: CardType, columnId: string) => {
    setTargetColumn(columnId);
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const columnId = active.data.current?.columnId as string;
    const card = columns
      .flatMap((col) => col.cards)
      .find((c) => c.id === active.id);
    if (card && columnId) {
      setActiveCard({ ...card, columnId });
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (!over) return;
    const overId = over.id as string;
    const overIsColumn = over.data.current?.type === "Column";
    if (overIsColumn) {
      setOverColumnId(overId);
      return;
    }
    const overIsCard = over.data.current?.type === "Card";
    if (overIsCard) {
      const overColumn = over.data.current?.columnId as string;
      setOverColumnId(overColumn);
    }
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
      handleCloseDeleteModal(); // Cierra el modal después de confirmar
    }
  };

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    setActiveCard(null);
    setOverColumnId(null);

    if (!over) return;

    const sourceColumnId = active.data.current?.columnId as string;
    const cardId = active.id as string;

    // --- LÓGICA DE REORDENAMIENTO (DENTRO DE LA MISMA COLUMNA) ---
    // Esta parte ya funciona bien, pero la dejamos para claridad.
    const overIsCard = over.data.current?.type === "Card";
    const overIsColumn = over.data.current?.type === "Column";

    if (
      sourceColumnId === (overIsCard ? over.data.current?.columnId : over.id)
    ) {
      const overId = over.id as string;
      if (cardId === overId) return; // No hacer nada si se suelta sobre sí misma

      const column = columns.find((c) => c.id === sourceColumnId);
      if (!column) return;

      const sourceIndex = column.cards.findIndex((c) => c.id === cardId);
      const destIndex = column.cards.findIndex((c) => c.id === overId);

      if (sourceIndex !== -1 && destIndex !== -1) {
        reorderCard(sourceColumnId, sourceIndex, destIndex);
      }
      return;
    }

    // --- LÓGICA DE MOVIMIENTO (ENTRE COLUMNAS DIFERENTES) ---
    // 👇 ¡AQUÍ ESTÁ LA NUEVA LÓGICA MEJORADA! 👇

    let destColumnId: string;
    let destIndex: number;

    // Escenario 1: Se suelta sobre una tarjeta existente en otra columna
    if (overIsCard) {
      destColumnId = over.data.current?.columnId as string;
      const destColumn = columns.find((c) => c.id === destColumnId);
      if (!destColumn) return;

      // El índice de destino es el de la tarjeta sobre la que soltamos
      destIndex = destColumn.cards.findIndex((c) => c.id === over.id);

      // Escenario 2: Se suelta en un área vacía de otra columna
    } else if (overIsColumn) {
      destColumnId = over.id as string;
      const destColumn = columns.find((c) => c.id === destColumnId);
      if (!destColumn) return;

      // El índice de destino es el final de la nueva columna
      destIndex = destColumn.cards.length;
    } else {
      return; // No es un destino válido
    }

    // Llamamos a moveCard con la información precisa
    if (sourceColumnId && destColumnId) {
      moveCard(cardId, sourceColumnId, destColumnId, destIndex);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="bg-zinc-950 text-white min-h-screen p-8 overflow-x-auto">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Kanba</h1>
          {/* 👇 5. Contenedor para los botones de la cabecera */}
          <div className="flex items-center gap-4">
            {columns.length > 0 && (
              <button
                onClick={() => handleOpenCreateModal(columns[0].id)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Añadir Tarea
              </button>
            )}
            <button
              onClick={() => supabase.auth.signOut()}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Cerrar Sesión
            </button>
          </div>
        </header>
        <main className="flex gap-6">
          {columns.map((column) => (
            <Column
              key={column.id}
              id={column.id}
              title={column.title}
              cards={column.cards}
              activeCard={activeCard}
              onCardClick={handleOpenEditModal}
              overColumnId={overColumnId}
              onDeleteColumn={handleOpenDeleteModal}
            />
          ))}
          <AddColumnForm />
        </main>
        <DragOverlay>
          {activeCard ? (
            <Card
              id={activeCard.id}
              title={activeCard.title}
              columnId={activeCard.columnId}
              onClick={() => {}}
            />
          ) : null}
        </DragOverlay>
        <TaskModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          task={editingTask}
          initialColumnId={targetColumn}
          columns={columns}
        />
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          itemName={columnToDelete?.title || ""}
        />
      </div>
    </DndContext>
  );
}

export default App;
