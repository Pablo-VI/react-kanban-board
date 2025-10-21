// src/components/Card.tsx
import { useSortable } from "@dnd-kit/sortable";
import { useBoardStore } from "../store";

type CardProps = {
  id: string;
  title: string;
  columnId: string;
};

export function Card({ id, title, columnId }: CardProps) {
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
      columnId: columnId,
    },
  });

  const style = {
    transition,
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="group bg-zinc-800 p-3 rounded-md border-2 border-zinc-700 shadow-sm cursor-grab active:cursor-grabbing flex justify-between items-center"
    >
      <p className="text-sm font-medium text-zinc-100">{title}</p>
      {/* 4. Delete Button */}
      <button
        // Make button invisible by default, and visible on parent hover
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
