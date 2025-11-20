// src/components/Card.tsx

/**
 * ÍNDICE DE CONTENIDOS
 * ------------------------------------------------------------------
 * 1. Importaciones
 * 2. Definición de Tipos (CardProps)
 * 3. Componente Principal Card
 * 3.1. Configuración de useSortable (DnD Kit)
 * 3.2. Estilos para la Transformación (Movimiento)
 * 3.3. Acceso al Store Global
 * 3.4. Estado Local (Hover)
 * 3.5. Manejadores de Eventos (Checkbox, Delete)
 * 3.6. Renderizado
 * 3.6.1. Contenedor Principal
 * 3.6.2. Checkbox Personalizado
 * 3.6.3. Título de la Tarjeta
 * 3.6.4. Botón de Eliminar
 * ------------------------------------------------------------------
 */

/* 1. Importaciones */
import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { type Card as CardType, useBoardStore } from "../store";

/* 2. Definición de Tipos */
interface CardProps {
  card: CardType; // Objeto de la tarjeta (id, título, estado, etc.)
  isActive?: boolean; // Indica si es la tarjeta que se está arrastrando (overlay)
  onClick: (card: CardType) => void; // Callback para abrir el modal de edición
  columnId: string; // ID de la columna a la que pertenece
}

/* 3. Componente Principal Card */
export const Card: React.FC<CardProps> = ({
  card,
  isActive = false,
  onClick,
  columnId,
}) => {
  /* 3.1. Configuración de useSortable (DnD Kit) */
  // Este hook conecta el componente con el sistema de arrastrar y soltar
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging, // Booleano que indica si ESTA tarjeta específica se está arrastrando
  } = useSortable({
    id: card.id,
    data: {
      type: "Card",
      card: card,
      columnId: columnId,
    },
  });

  /* 3.2. Estilos para la Transformación */
  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  /* 3.3. Acceso al Store Global */
  const toggleCardDone = useBoardStore((state) => state.toggleCardDone);
  const deleteCard = useBoardStore((state) => state.deleteCard);

  /* 3.4. Estado Local */
  const [isHovered, setIsHovered] = useState(false);

  /* 3.5. Manejadores de Eventos */

  // Maneja el cambio del checkbox "Completada"
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation(); // Evita abrir el modal de edición
    toggleCardDone(card.id, e.target.checked);
  };

  // Maneja el clic en el botón de eliminar
  const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Evita abrir el modal de edición
    deleteCard(card.id);
  };

  /* 3.6. Renderizado */
  return (
    /* 3.6.1. Contenedor Principal */
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`group relative mb-3 bg-neutral-800 rounded-lg shadow-md cursor-grab active:cursor-grabbing
                  ${isActive ? "ring-2 ring-blue-500" : ""} 
                  ${
                    // Si se arrastra, se oculta (para dejar el hueco). Si está hecha, se atenúa.
                    isDragging ? "opacity-0" : card.is_done ? "opacity-60" : ""
                  }`}
      onClick={() => onClick(card)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 3.6.2. Checkbox Personalizado (Círculo) */}
      <div
        className={`
          absolute top-1/2 left-4 transform -translate-y-1/2
          transition-all duration-300 ease-in-out
          ${
            // Animación de deslizamiento desde la izquierda
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

      {/* 3.6.3. Título de la Tarjeta */}
      <h3
        className={`
          text-lg font-medium 
          transition-all duration-300 ease-in-out
          
          p-4            /* Padding base */
          pr-8           /* Espacio para el botón X a la derecha */
          
          /* Desplazamiento del texto cuando aparece el checkbox */
          ${isHovered || card.is_done ? "pl-10" : "pl-4"} 

          /* Estilos de texto */
          break-words    /* Evita desbordamiento con palabras largas */
          text-justify   /* Justificación */

          /* Estilos condicionales (tachado) */
          ${card.is_done ? "line-through text-gray-400" : "text-white"} 
        `}
      >
        {card.title}
      </h3>

      {/* 3.6.4. Botón de Eliminar (X) */}
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
