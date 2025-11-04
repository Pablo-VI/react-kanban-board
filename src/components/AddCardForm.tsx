// src/components/AddCardForm.tsx
import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { useBoardStore } from "../store";

type AddCardFormProps = {
  columnId: string;
};

export function AddCardForm({ columnId }: AddCardFormProps) {
  const addCard = useBoardStore((state) => state.addCard);
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const formRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Función para guardar
  const handleSubmit = () => {
    if (title.trim() !== "") {
      addCard(columnId, title); // Solo añadimos título desde aquí
      setTitle("");
      textareaRef.current?.focus(); // Mantenemos el foco para añadir más tarjetas
    }
  };

  // Función para cancelar
  const handleCancel = () => {
    setIsAdding(false);
    setTitle("");
  };

  // Auto-foco al abrir
  useEffect(() => {
    if (isAdding) {
      textareaRef.current?.focus();
    }
  }, [isAdding]);

  // Manejador para clic afuera y ESC
  useEffect(() => {
    if (!isAdding) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        handleCancel();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAdding]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      // Enter para guardar (Shift+Enter para nueva línea)
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  // Vista cerrada (botón)
  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="w-full text-left p-2.5 text-zinc-400 hover:text-white hover:bg-zinc-700/70 rounded-md transition-colors"
      >
        + Añade una tarjeta
      </button>
    );
  }

  // Vista abierta (formulario)
  return (
    <div ref={formRef} className="flex flex-col gap-2">
      <textarea
        ref={textareaRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Introduce un título para esta tarjeta..."
        rows={3}
        className="bg-zinc-700 text-white p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none shadow-inner"
      />
      <div className="flex gap-2 items-center">
        <button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded"
        >
          Añadir tarjeta
        </button>
        <button
          onClick={handleCancel}
          className="text-gray-400 hover:text-white"
          aria-label="Cancelar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
