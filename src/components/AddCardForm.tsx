// src/components/AddCardForm.tsx

/**
 * ÍNDICE DE CONTENIDOS
 * ------------------------------------------------------------------
 * 1. Importaciones y Tipos
 * 2. Definición del Componente y Estado
 * 3. Manejadores de Eventos (Submit, Cancel)
 * 4. Efectos Secundarios (Focus, Click Outside)
 * 5. Manejo de Teclado
 * 6. Renderizado: Botón de Apertura (Estado Inactivo)
 * 7. Renderizado: Formulario de Creación (Estado Activo)
 * ------------------------------------------------------------------
 */

/* 1. Importaciones y Tipos */
import {
  useState,
  useRef,
  useEffect,
  type KeyboardEvent,
  useCallback,
} from "react";
import { useBoardStore } from "../store";

type AddCardFormProps = {
  columnId: string; // ID de la columna donde se añadirá la tarjeta
  onFormOpen: () => void; // Callback para notificar al padre (scroll automático)
};

/* 2. Definición del Componente y Estado */
export function AddCardForm({ columnId, onFormOpen }: AddCardFormProps) {
  // Conexión con el Store global
  const addCard = useBoardStore((state) => state.addCard);

  // Estados locales
  const [isAdding, setIsAdding] = useState(false); // Controla si el formulario es visible
  const [title, setTitle] = useState(""); // Valor del input
  const [isLoading, setIsLoading] = useState(false); // Estado de carga para evitar doble envío

  // Referencias al DOM
  const formRef = useRef<HTMLDivElement>(null); // Para detectar clics fuera
  const textareaRef = useRef<HTMLTextAreaElement>(null); // Para el auto-focus

  /* 3. Manejadores de Eventos (Submit, Cancel) */

  // Envía la nueva tarjeta al store
  const handleSubmit = async () => {
    if (title.trim() === "" || isLoading) return;

    setIsLoading(true);
    const success = await addCard(columnId, title);
    setIsLoading(false);

    if (success) {
      setTitle(""); // Limpia el campo si fue exitoso
      textareaRef.current?.focus(); // Mantiene el foco para añadir otra tarjeta rápidamente
    }
  };

  // Cancela la creación y cierra el formulario
  const handleCancel = useCallback(() => {
    if (isLoading) return;
    setIsAdding(false);
    setTitle("");
  }, [isLoading]);

  /* 4. Efectos Secundarios (Focus, Click Outside) */

  // Auto-focus y notificación al padre cuando se abre el formulario
  useEffect(() => {
    if (isAdding) {
      textareaRef.current?.focus();
      onFormOpen();
    }
  }, [isAdding, onFormOpen]);

  // Detecta clics fuera del formulario para cerrarlo automáticamente
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
  }, [isAdding, handleCancel]);

  /* 5. Manejo de Teclado */
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sin Shift envía el formulario
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    // Escape cancela la acción
    else if (e.key === "Escape") {
      handleCancel();
    }
  };

  /* 6. Renderizado: Botón de Apertura (Estado Inactivo) */
  if (!isAdding) {
    return (
      <button
        onClick={() => {
          setIsAdding(true);
          onFormOpen();
        }}
        className="w-full text-left p-2.5 mb-3 text-zinc-400 hover:text-white hover:bg-zinc-700/70 rounded-md transition-colors cursor-pointer"
      >
        + Añade una tarjeta
      </button>
    );
  }

  /* 7. Renderizado: Formulario de Creación (Estado Activo) */
  return (
    <div ref={formRef} className="flex flex-col gap-2 pb-2">
      <textarea
        ref={textareaRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Introduce un título para esta tarjeta..."
        rows={3}
        maxLength={100} // Límite de caracteres para consistencia UI
        className="bg-zinc-700 text-white p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none shadow-inner"
        disabled={isLoading}
      />

      <div className="flex gap-2 items-center">
        {/* Botón Guardar */}
        <button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded disabled:opacity-50 cursor-pointer"
          disabled={isLoading}
        >
          {isLoading ? "..." : "Añadir tarjeta"}
        </button>

        {/* Botón Cancelar (Icono X) */}
        <button
          onClick={handleCancel}
          className="text-gray-400 hover:text-white disabled:opacity-50 cursor-pointer"
          aria-label="Cancelar"
          disabled={isLoading}
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
