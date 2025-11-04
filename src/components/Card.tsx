// src/components/Card.tsx
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
      cardId: id,
      columnId: columnId,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteCard(id);
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-zinc-700 p-3 rounded-md shadow-md opacity-50 border-2 border-blue-500 cursor-grab relative h-[60px]"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="bg-zinc-700 p-3 rounded-md shadow-md flex items-center justify-between cursor-grab relative group"
    >
      <p className="text-white text-sm break-all pr-8">{title}</p>

      {/* 👇 MODIFICACIÓN: Ajustamos el tamaño del SVG y los paddings del botón */}
      <button
        onClick={handleDelete}
        className="absolute right-1.5 w-6 h-6 rounded-full text-zinc-400 opacity-0 group-hover:opacity-100 
                   hover:bg-red-500 hover:text-white 
                   active:bg-red-700 active:text-white 
                   transition-all duration-150 focus:outline-none
                   flex items-center justify-center
                   cursor-pointer" 
        aria-label="Eliminar tarea"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="w-4 h-4" // <-- El SVG mantiene su tamaño, ahora el botón se ajusta a él
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
      {/* 👆 FIN MODIFICACIÓN */}
    </div>
  );
}
