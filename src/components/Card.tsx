// src/components/Card.tsx
import { useSortable } from "@dnd-kit/sortable";
import { useBoardStore } from "../store";

type CardProps = {
  id: string;
  title: string;
  columnId: string;
  onClick: () => void;
};

export function Card({ id, title, columnId, onClick }: CardProps) {
  const deleteCard = useBoardStore((state) => state.deleteCard);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: id,
    data: {
      type: "Card",
      columnId: columnId,
    },
  });

  const style = {
    transition,
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      // 👇 AHORA: Los listeners se aplican al contenedor principal
      {...listeners}
      onClick={onClick}
      // 👇 AHORA: La clase 'cursor-grab' y 'flex' están aquí
      className="group bg-zinc-800 p-3 rounded-md border-2 border-zinc-700 shadow-sm flex justify-between items-center cursor-grab"
    >
      {/* 👇 ANTES: Los listeners y el cursor estaban en este div */}
      <div className="flex-grow">
        <p className="text-sm font-medium text-zinc-100 break-all">{title}</p>
      </div>
      <button
        className="opacity-0 group-hover:opacity-100 transition-opacity z-10" // z-10 para asegurar que esté por encima
        onClick={(e) => {
          e.stopPropagation(); // Esto es crucial para que el clic no active el arrastre
          deleteCard(id);
        }}
      >
        🗑️
      </button>
    </div>
  );
}
