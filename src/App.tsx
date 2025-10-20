// src/App.tsx
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Column } from "./components/Column";
import { useBoardStore } from "./store";

function App() {
  const columns = useBoardStore((state) => state.columns);
  const moveCard = useBoardStore((state) => state.moveCard);
  const reorderCard = useBoardStore((state) => state.reorderCard);

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

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="bg-zinc-950 text-white min-h-screen p-8 overflow-x-auto">
        <h1 className="text-3xl font-bold mb-8">Mi Tablero Kanban</h1>
        <main className="flex gap-6">
          {columns.map((column) => (
            <Column
              key={column.id}
              id={column.id}
              title={column.title}
              cards={column.cards}
            />
          ))}
        </main>
      </div>
    </DndContext>
  );
}

export default App;
