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
  overColumnId: string | null;
};

export function Column({
  id,
  title,
  cards,
  activeCard,
  onCardClick,
  overColumnId,
  onDeleteColumn,
}: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
    data: {
      type: "Column", // <-- MODIFICACIÓN: Se añade el tipo
      columnId: id,
      index: cards.length,
    },
  });

  const cardIds = cards.map((card) => card.id);

  // MODIFICACIÓN: Lógica de resaltado mejorada
  const columnBackgroundColor =
    isOver || overColumnId === id ? "bg-zinc-800/60" : "bg-zinc-900/50";

  // MODIFICACIÓN: Lógica del placeholder mejorada
  const showPlaceholder =
    activeCard && (isOver || overColumnId === id) && activeCard.columnId !== id;

  return (
    <div
      ref={setNodeRef}
      className={`w-72 rounded-md shadow-md flex-shrink-0 transition-colors duration-200 ${columnBackgroundColor}`}
    >
      <div className="group p-3 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-zinc-100 break-all">
          {title}
        </h2>
        {/* 👇 AÑADIMOS EL BOTÓN DE BORRADO */}
        <button
          onClick={() => onDeleteColumn(id, title)}
          className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-all focus:outline-none"
          aria-label={`Eliminar columna ${title}`}
        >
          ✖️
        </button>
      </div>{" "}
      <div className="p-3 space-y-3">
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

        {showPlaceholder && (
          <div className="h-16 bg-zinc-700/50 rounded-md border-2 border-dashed border-blue-500"></div>
        )}
      </div>
    </div>
  );
}
