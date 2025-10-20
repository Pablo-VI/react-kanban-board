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
};

export function Column({ id, title, cards }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
    data: {
      columnId: id,
      // Necesario para saber en qué índice soltar la tarjeta al moverla a OTRA columna
      index: cards.length,
    },
  });

  // Extraemos los IDs de las tarjetas. SortableContext necesita un array de IDs.
  const cardIds = cards.map((card) => card.id);

  const columnBackgroundColor = isOver ? "bg-zinc-800/60" : "bg-zinc-900/50";

  return (
    <div
      ref={setNodeRef}
      className={`w-72 rounded-md shadow-md flex-shrink-0 transition-colors duration-200 ${columnBackgroundColor}`}
    >
      <div className="p-3">
        <h2 className="text-lg font-semibold text-zinc-100">{title}</h2>
      </div>
      <div className="p-3 space-y-3">
        {/* Envolvemos las tarjetas en el SortableContext para que sean reordenables */}
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <Card
              key={card.id}
              id={card.id}
              title={card.title}
              columnId={id}
              // El prop 'index' ya no es necesario al usar useSortable en el componente Card
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
