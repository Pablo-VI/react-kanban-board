// src/components/Card.tsx
import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { type Card as CardType, useBoardStore } from "../store";

interface CardProps {
  card: CardType;
  isActive?: boolean;
  onClick: (card: CardType) => void;
  columnId: string;
}

export const Card: React.FC<CardProps> = ({
  card,
  isActive = false,
  onClick,
  columnId,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: "Card",
      card: card,
      columnId: columnId,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const toggleCardDone = useBoardStore((state) => state.toggleCardDone);
  const deleteCard = useBoardStore((state) => state.deleteCard);

  const [isHovered, setIsHovered] = useState(false);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    toggleCardDone(card.id, e.target.checked);
  };

  const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    deleteCard(card.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`group relative mb-3 bg-neutral-800 rounded-lg shadow-md cursor-grab active:cursor-grabbing
                  ${isActive ? "ring-2 ring-blue-500" : ""} 
                  ${
                    isDragging ? "opacity-0" : card.is_done ? "opacity-60" : ""
                  }`}
      onClick={() => onClick(card)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`
          absolute top-1/2 left-4 transform -translate-y-1/2
          transition-all duration-300 ease-in-out
          ${
            isHovered || card.is_done
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-full"
          }
        `}
      >
        <input
          type="checkbox"
          checked={card.is_done}
          onChange={handleCheckboxChange}
          onClick={(e) => e.stopPropagation()}
          className="w-5 h-5 appearance-none border-2 border-white rounded-full bg-transparent checked:bg-emerald-500 checked:border-emerald-500 cursor-pointer"
          style={{ transition: "background-color 0.2s, border-color 0.2s" }}
        />
      </div>

      <h3
        className={`
          text-lg font-medium 
          transition-all duration-300 ease-in-out  p-4 pr-8
          ${isHovered || card.is_done ? "pl-10" : "pl-4"}
          break-words text-justify ${
            card.is_done ? "line-through text-gray-400" : "text-white"
          }
        `}
      >
        {card.title}
      </h3>

      <button
        onClick={handleDeleteClick}
        className="absolute top-1/2 right-0.5 p-1 transform -translate-y-1/2
                   opacity-0 group-hover:opacity-100 
                   text-gray-400 hover:text-red-500 active:text-red-700
                   transition-opacity duration-150 focus:outline-none cursor-pointer"
        aria-label={`Eliminar tarea ${card.title}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
};
