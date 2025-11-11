// src/components/Column.tsx
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
  id: string;
  title: string;
  cards: CardType[];
  onCardClick: (task: CardType, columnId: string) => void;
  onDeleteColumn: (columnId: string, columnTitle: string) => void;
  onRenameColumn: (columnId: string, newTitle: string) => void;
  activeCard: (CardType & { columnId: string }) | null;
  overColumnId: string | null;
};

export function Column({
  id,
  title,
  cards,
  onCardClick,
  overColumnId,
  onDeleteColumn,
  onRenameColumn,
}: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
    data: {
      type: "Column",
      columnId: id,
    },
  });

  const cardIds = cards.map((card) => card.id);
  const columnBackgroundColor =
    isOver || overColumnId === id ? "bg-zinc-800/60" : "bg-zinc-900/50";

  const scrollableContainerRef = useRef<HTMLDivElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditedTitle(title);
  }, [title]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleTitleClick = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedTitle(title);
  };

  const handleSave = () => {
    if (editedTitle.trim() && editedTitle !== title) {
      onRenameColumn(id, editedTitle.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const handleBlur = () => {
    handleCancel();
  };

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

  return (
    <div
      ref={setNodeRef}
      className={`w-72 rounded-md shadow-md flex flex-col flex-shrink-0 transition-colors duration-200 ${columnBackgroundColor} max-h-[80vh]`}
    >
      <div className="group p-3 flex justify-between items-center flex-shrink-0">
        {!isEditing ? (
          <h2
            onClick={handleTitleClick}
            className="text-lg font-semibold text-zinc-100 break-all cursor-pointer"
          >
            {title}
          </h2>
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className="text-lg font-semibold text-zinc-100 bg-zinc-700 border border-zinc-500 rounded-md p-0.5 w-full mr-2"
            autoFocus
          />
        )}

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

      <div
        ref={scrollableContainerRef}
        className="p-3 pt-0 pb-0 space-y-3 overflow-y-auto flex-grow hide-scrollbar"
      >
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
        <AddCardForm columnId={id} onFormOpen={handleFormOpen} />
      </div>
    </div>
  );
}
