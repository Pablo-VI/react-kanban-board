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
import { arrayMove } from "@dnd-kit/sortable";
// 👇 CORRECCIÓN: Importamos el tipo ColumnType para usarlo en las funciones
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

function App() {
  // ... (Esta parte no cambia)
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return <AuthPage />;
  } else {
    return <Board key={session.user.id} />;
  }
}

function Board() {
  const fetchBoard = useBoardStore((state) => state.fetchBoard);
  const columns = useBoardStore((state) => state.columns);
  const setColumns = useBoardStore((state) => state.setColumns);
  const _updateCardOrders = useBoardStore((state) => state._updateCardOrders);

  const [originalColumns, setOriginalColumns] = useState(columns);

  // ... (El resto de los useState y useEffects no cambian)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<CardType | null>(null);
  const [targetColumn, setTargetColumn] = useState("");
  const [activeCard, setActiveCard] = useState<
    (CardType & { columnId: string }) | null
  >(null);
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

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

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const columnId = active.data.current?.columnId as string;
    const card = columns
      .flatMap((col) => col.cards)
      .find((c) => c.id === active.id);
    if (card && columnId) {
      setActiveCard({ ...card, columnId });
    }
    setOriginalColumns(columns);
  };

  // 👇 CORRECCIÓN COMPLETA: Lógica reescrita para evitar el updater y los tipos 'any'
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

    // Obtenemos el estado más reciente directamente
    const currentColumns = useBoardStore.getState().columns;
    // Creamos una copia profunda para evitar mutaciones no deseadas
    const newColumns = JSON.parse(
      JSON.stringify(currentColumns)
    ) as ColumnType[];

    const sourceColIndex = newColumns.findIndex(
      (c: ColumnType) => c.id === sourceColumnId
    );
    const destColIndex = newColumns.findIndex(
      (c: ColumnType) => c.id === destColumnId
    );

    // Verificamos que los índices son válidos
    if (sourceColIndex === -1 || destColIndex === -1) return;

    const sourceCards = newColumns[sourceColIndex].cards;
    const destCards = newColumns[destColIndex].cards;

    const activeCardIndex = sourceCards.findIndex((c) => c.id === activeId);
    if (activeCardIndex === -1) return;

    const [movedCard] = sourceCards.splice(activeCardIndex, 1);
    destCards.push(movedCard);

    // Actualizamos el estado con el array ya modificado
    setColumns(newColumns);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveCard(null);
    const { active, over } = event;

    if (!over) {
      setColumns(originalColumns);
      return;
    }

    const sourceColumnId = active.data.current?.columnId as string;
    const overIsColumn = over.data.current?.type === "Column";
    const destColumnId = overIsColumn
      ? (over.id as string)
      : (over.data.current?.columnId as string);
    const activeId = active.id as string;
    const overId = over.id as string;

    // 👇 CORRECCIÓN: Añadimos tipos explícitos
    const sourceCol = columns.find((c: ColumnType) => c.id === sourceColumnId);
    const destCol = columns.find((c: ColumnType) => c.id === destColumnId);

    if (!sourceCol || !destCol) {
      setColumns(originalColumns);
      return;
    }

    const sourceCardIndex = sourceCol.cards.findIndex((c) => c.id === activeId);
    let destCardIndex;
    if (over.data.current?.type === "Card") {
      destCardIndex = destCol.cards.findIndex((c) => c.id === overId);
    } else {
      destCardIndex = destCol.cards.length;
    }

    // 👇 CORRECCIÓN: Usamos 'const' en lugar de 'let'
    const newColumns = JSON.parse(JSON.stringify(columns)) as ColumnType[];

    if (sourceColumnId === destColumnId) {
      const colIndex = newColumns.findIndex(
        (c: ColumnType) => c.id === sourceColumnId
      );
      if (sourceCardIndex !== -1 && destCardIndex !== -1) {
        const newCards = arrayMove(
          newColumns[colIndex].cards,
          sourceCardIndex,
          destCardIndex
        );
        newColumns[colIndex] = { ...newColumns[colIndex], cards: newCards };
      }
    } else {
      const sourceColIndex = newColumns.findIndex(
        (c: ColumnType) => c.id === sourceColumnId
      );
      const destColIndex = newColumns.findIndex(
        (c: ColumnType) => c.id === destColumnId
      );

      if (sourceColIndex !== -1 && sourceCardIndex !== -1) {
        const [movedCard] = newColumns[sourceColIndex].cards.splice(
          sourceCardIndex,
          1
        );
        newColumns[destColIndex].cards.splice(destCardIndex, 0, movedCard);
      }
    }

    setColumns(newColumns);

    const cardsToUpdate: {
      id: string;
      card_order: number;
      column_id: number;
    }[] = [];
    const updatedSourceCol = newColumns.find(
      (c: ColumnType) => c.id === sourceColumnId
    )!;
    updatedSourceCol.cards.forEach((card, index) => {
      cardsToUpdate.push({
        id: card.id,
        card_order: index,
        column_id: parseInt(sourceColumnId),
      });
    });

    if (sourceColumnId !== destColumnId) {
      const updatedDestCol = newColumns.find(
        (c: ColumnType) => c.id === destColumnId
      )!;
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
    _updateCardOrders(cardsToUpdate);
  }

  // ... (El resto del componente Board no cambia)
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
              overColumnId={null}
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
