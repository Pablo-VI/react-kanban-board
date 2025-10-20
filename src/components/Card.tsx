// src/components/Card.tsx
import { useSortable } from "@dnd-kit/sortable";

type CardProps = {
  id: string;
  title: string;
  columnId: string;
};

export function Card({ id, title, columnId }: CardProps) {
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
      className="bg-zinc-800 p-3 rounded-md border-2 border-zinc-700 ..."
    >
      <p className="text-sm font-medium text-zinc-100">{title}</p>
    </div>
  );
}
