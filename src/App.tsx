import { useState } from "react";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Column } from "./components/Column";
import { AddColumnForm } from "./components/AddColumnForm";
import { useBoardStore } from "./store";

function App() {
  const columns = useBoardStore((state) => state.columns);
  const moveCard = useBoardStore((state) => state.moveCard);
  const reorderCard = useBoardStore((state) => state.reorderCard);
  const addCard = useBoardStore((state) => state.addCard);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const sourceColumnId = active.data.current?.columnId as string;
    const destColumnId = over.data.current?.columnId as string;

    // Caso 1: Reordenar dentro de la misma columna
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
      return;
    }

    // Caso 2: Mover a una columna diferente (lógica que ya teníamos)
    const cardId = active.id as string;
    const destIndex = (over.data.current?.index as number) ?? 0;

    if (sourceColumnId && destColumnId) {
      moveCard(cardId, sourceColumnId, destColumnId, destIndex);
    }
  }

  const handleAddTask = () => {
    if (newTaskTitle.trim() === "") return;
    addCard("todo", newTaskTitle);
    setNewTaskTitle("");
    setIsAddingTask(false);
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="bg-zinc-950 text-white min-h-screen p-8 overflow-x-auto">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Mi Tablero Kanban</h1>
          <button
            onClick={() => setIsAddingTask(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Añadir Tarea
          </button>
        </header>
        {/* 6. Formulario condicional */}
        {isAddingTask && (
          <div className="mb-4 p-4 bg-zinc-800 rounded-lg flex gap-4">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Introduce el título de la tarea..."
              autoFocus
              className="bg-zinc-700 text-white p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAddTask}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Añadir
            </button>
            <button
              onClick={() => setIsAddingTask(false)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Cancelar
            </button>
          </div>
        )}
        <main className="flex gap-6">
          {columns.map((column) => (
            <Column
              key={column.id}
              id={column.id}
              title={column.title}
              cards={column.cards}
            />
          ))}
          <AddColumnForm />
        </main>
      </div>
    </DndContext>
  );
}

export default App;
