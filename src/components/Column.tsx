// src/components/Column.tsx
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Card as CardType } from "../store";
import { Card } from "./Card";

type ColumnProps = {
  id: string;
  title: string;
  cards: CardType[];
  onCardClick: (task: CardType, columnId: string) => void;
  onDeleteColumn: (columnId: string, columnTitle: string) => void;
  activeCard: (CardType & { columnId: string }) | null;
  overColumnId: string | null; // Aunque no lo usemos para el placeholder, es bueno mantenerlo por si se necesita para otros efectos
};

export function Column({
  id,
  title,
  cards,
  onCardClick,
  overColumnId,
  onDeleteColumn,
}: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
    data: {
      type: "Column",
      columnId: id,
    },
  });

  const cardIds = cards.map((card) => card.id);

  const columnBackgroundColor =
    isOver || overColumnId === id ? "bg-zinc-800/60" : "bg-zinc-900/50";

  return (
    // 👇 MODIFICACIÓN: El contenedor principal ahora tiene una altura mínima
    // para asegurar que siempre haya un área donde soltar, incluso si está vacío.
    <div
      ref={setNodeRef}
      className={`w-72 rounded-md shadow-md flex flex-col flex-shrink-0 transition-colors duration-200 ${columnBackgroundColor} min-h-[150px]`}
    >
      <div className="group p-3 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-zinc-100 break-all">
          {title}
        </h2>
        <button
          onClick={() => onDeleteColumn(id, title)}
          className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-all focus:outline-none"
          aria-label={`Eliminar columna ${title}`}
        >
          ✖️
        </button>
      </div>

      {/* 👇 MODIFICACIÓN CLAVE: Hemos eliminado el div intermedio.
          Ahora el SortableContext está directamente dentro del área droppable. */}
      <div className="p-3 pt-0 space-y-3">
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <Card
              key={card.id}
              id={card.id}
              title={card.title}
              columnId={id}
              onClick={() => onCardClick(card, id)}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
