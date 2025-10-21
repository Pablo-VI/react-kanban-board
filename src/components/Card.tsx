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
      type: "Card", // <-- MODIFICACIÓN: Se añade el tipo
      columnId: columnId,
    },
  });

  const style = {
    transition,
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0 : 1, // La tarjeta original se oculta al arrastrar
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      onClick={onClick}
      className="group bg-zinc-800 p-3 rounded-md border-2 border-zinc-700 shadow-sm flex justify-between items-center"
    >
      <div {...listeners} className="flex-grow cursor-grab">
        <p className="text-sm font-medium text-zinc-100">{title}</p>
      </div>
      <button
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          deleteCard(columnId, id);
        }}
      >
        🗑️
      </button>
    </div>
  );
}
