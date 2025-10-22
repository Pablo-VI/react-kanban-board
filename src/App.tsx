import { useState, useEffect } from "react";
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

function App() {
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
  const [overColumnId, setOverColumnId] = useState<string | null>(null); // <-- MODIFICACIÓN: Nuevo estado

  useEffect(() => {
    fetchBoard();
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

  // <-- MODIFICACIÓN: Nueva función
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

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) {
      setActiveCard(null);
      setOverColumnId(null);
      return;
    }

    const sourceColumnId = active.data.current?.columnId as string;
    const destColumnId = over.data.current?.columnId as string;

    if (sourceColumnId === destColumnId) {
      const cardId = active.id as string;
      const overId = over.id as string;
      const column = columns.find((c) => c.id === sourceColumnId);
      if (!column) return;
      const sourceIndex = column.cards.findIndex((c) => c.id === cardId);
      const destIndex = column.cards.findIndex((c) => c.id === overId);
      if (sourceIndex !== -1 && destIndex !== -1) {
        reorderCard(sourceColumnId, sourceIndex, destIndex);
      }
    } else {
      const cardId = active.id as string;
      const destIndex = (over.data.current?.index as number) ?? 0;
      if (sourceColumnId && destColumnId) {
        moveCard(cardId, sourceColumnId, destColumnId, destIndex);
      }
    }

    setActiveCard(null);
    setOverColumnId(null); // <-- MODIFICACIÓN: Limpiar estado
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver} // <-- MODIFICACIÓN: Añadido
      onDragEnd={handleDragEnd}
    >
      <div className="bg-zinc-950 text-white min-h-screen p-8 overflow-x-auto">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Mi Tablero Kanban</h1>
          <button
            onClick={() => handleOpenCreateModal("todo")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Añadir Tarea
          </button>
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
              overColumnId={overColumnId} // <-- MODIFICACIÓN: Prop añadida
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
          columnId={targetColumn}
        />
      </div>
    </DndContext>
  );
}

export default App;
