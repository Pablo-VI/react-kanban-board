// src/components/Column.tsx

/**
 * ÍNDICE DE CONTENIDOS
 * ------------------------------------------------------------------
 * 1. Importaciones y Tipos
 * 2. Definición del Componente y Estado
 * 3. Efectos Secundarios (Auto-selección)
 * 4. Manejadores de Eventos (Edición de Título)
 * 5. Manejadores de Eventos (Teclado y Foco)
 * 6. Manejadores de Eventos (Scroll Automático)
 * 7. Renderizado
 * 7.1. Cabecera de la Columna (Título/Input y Eliminar)
 * 7.2. Cuerpo de la Columna (Lista de Tarjetas)
 * ------------------------------------------------------------------
 */

/* 1. Importaciones y Tipos */
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Card as CardType } from "../store";
import { Card } from "./Card";
import { AddCardForm } from "./AddCardForm";
import { useRef, useCallback, useState, useEffect } from "react";

type ColumnProps = {
  id: string; // ID único de la columna
  title: string; // Título actual de la columna
  cards: CardType[]; // Array de tarjetas dentro de esta columna
  onCardClick: (task: CardType) => void; // Callback al hacer clic en una tarjeta
  onDeleteColumn: (columnId: string, columnTitle: string) => void; // Callback para eliminar
  onRenameColumn: (columnId: string, newTitle: string) => void; // Callback para renombrar
  overColumnId: string | null; // ID de la columna sobre la que se está arrastrando algo (para resaltar)
};

/* 2. Definición del Componente y Estado */
export function Column({
  id,
  title,
  cards,
  onCardClick,
  overColumnId,
  onDeleteColumn,
  onRenameColumn,
}: ColumnProps) {
  // Configuración de drop-target (DnD Kit)
  const { setNodeRef, isOver } = useDroppable({
    id: id,
    data: {
      type: "Column",
      columnId: id,
    },
  });

  // IDs de las tarjetas para el contexto de ordenamiento
  const cardIds = cards.map((card) => card.id);

  // Estilo dinámico: Oscurece la columna si se está arrastrando algo sobre ella
  const columnBackgroundColor =
    isOver || overColumnId === id ? "bg-zinc-800/60" : "bg-zinc-900/50";

  // Referencias DOM
  const scrollableContainerRef = useRef<HTMLDivElement>(null); // Para autoscroll
  const inputRef = useRef<HTMLTextAreaElement>(null); // Para el input de edición de título

  // Estado local para la edición del título
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);

  /* 3. Efectos Secundarios */

  // Sincroniza el estado local si el título cambia desde fuera (props)
  useEffect(() => {
    setEditedTitle(title);
  }, [title]);

  // Auto-foco y selección de texto al entrar en modo edición
  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  /* 4. Manejadores de Eventos (Edición de Título) */

  const handleTitleClick = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedTitle(title); // Revertir cambios
  };

  const handleSave = () => {
    // Solo guardar si hay texto y es diferente al original
    if (editedTitle.trim() && editedTitle !== title) {
      onRenameColumn(id, editedTitle.trim());
    }
    setIsEditing(false);
  };

  /* 5. Manejadores de Eventos (Teclado y Foco) */

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Evitar salto de línea en el textarea
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const handleBlur = () => {
    handleCancel(); // Guardar al perder el foco podría ser opcional, aquí cancelamos
  };

  /* 6. Manejadores de Eventos (Scroll Automático) */

  // Se pasa al formulario de añadir tarjeta para que haga scroll al final al abrirse
  const handleFormOpen = useCallback(() => {
    setTimeout(() => {
      if (scrollableContainerRef.current) {
        scrollableContainerRef.current.scrollTo({
          top: scrollableContainerRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 50);
  }, []);

  /* 7. Renderizado */
  return (
    <div
      ref={setNodeRef}
      className={`w-72 rounded-md shadow-md flex flex-col flex-shrink-0 transition-colors duration-200 ${columnBackgroundColor} max-h-[80vh]`}
    >
      {/* 7.1. Cabecera de la Columna */}
      <div className="group p-3 flex justify-between items-center flex-shrink-0">
        {!isEditing ? (
          // Modo Visualización
          <h2
            onClick={handleTitleClick}
            className="text-lg font-semibold text-zinc-100 break-all cursor-pointer"
          >
            {title}
          </h2>
        ) : (
          // Modo Edición
          <textarea
            ref={inputRef}
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            maxLength={40}
            rows={2} // Altura suficiente para títulos largos
            className="text-lg font-semibold text-zinc-100 bg-zinc-700 border border-zinc-500 rounded-md p-0.5 w-full mr-2 resize-none overflow-hidden"
            autoFocus
          />
        )}

        {/* Botón Eliminar Columna */}
        <button
          onClick={() => onDeleteColumn(id, title)}
          className="opacity-0 group-hover:opacity-100 
                     text-gray-400                
                     hover:text-red-500           
                     active:text-red-700          
                     transition-all duration-150 focus:outline-none cursor-pointer
                     p-1"
          aria-label={`Eliminar columna ${title}`}
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

      {/* 7.2. Cuerpo de la Columna (Lista de Tarjetas) */}
      <div
        ref={scrollableContainerRef}
        className="p-3 pt-1 pb-0 space-y-3 overflow-y-auto flex-grow hide-scrollbar"
      >
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <Card
              key={card.id}
              card={card}
              onClick={() => onCardClick(card)}
              columnId={id}
            />
          ))}
        </SortableContext>

        {/* Formulario para añadir nueva tarjeta al final */}
        <AddCardForm columnId={id} onFormOpen={handleFormOpen} />
      </div>
    </div>
  );
}
