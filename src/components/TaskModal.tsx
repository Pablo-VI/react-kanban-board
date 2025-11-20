// src/components/TaskModal.tsx

/**
 * ÍNDICE DE CONTENIDOS
 * ------------------------------------------------------------------
 * 1. Importaciones y Tipos
 * 2. Definición del Componente y Estado
 * 3. Efectos Secundarios (Sincronización UI)
 * 3.1. Control de Apertura/Cierre del Dialog
 * 3.2. Cierre al hacer clic en el fondo (Backdrop)
 * 3.3. Inicialización de Datos de la Tarea y Autofocus
 * 4. Manejadores de Eventos (Guardar, Teclado)
 * 5. Renderizado
 * 5.1. Contenedor Principal del Modal
 * 5.2. Campos de Edición (Título, Descripción)
 * 5.3. Checkbox de Estado "Completada"
 * 5.4. Botones de Acción (Cancelar, Guardar)
 * ------------------------------------------------------------------
 */

/* 1. Importaciones y Tipos */
import { useEffect, useState, useRef, type KeyboardEvent } from "react";
import { useBoardStore, type Card } from "../store";

type TaskModalProps = {
  isOpen: boolean; // Controla la visibilidad del modal
  onClose: () => void; // Función para cerrar el modal
  task: Card | null; // Datos de la tarjeta a editar (o null si no hay selección)
};

/* 2. Definición del Componente y Estado */
export function TaskModal({ isOpen, onClose, task }: TaskModalProps) {
  // Acceso a la acción de editar tarjeta del store
  const { editCard } = useBoardStore();

  // Estados locales para el formulario
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isDone, setIsDone] = useState(false);

  // Referencia al elemento nativo <dialog>
  const dialogRef = useRef<HTMLDialogElement>(null);

  /* 3. Efectos Secundarios */

  // 3.1. Sincroniza el estado 'isOpen' con los métodos nativos del <dialog>
  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  // 3.2. Detecta clics en el backdrop (fondo oscuro) para cerrar el modal
  useEffect(() => {
    const dialogElement = dialogRef.current;

    const handleMouseDown = (event: MouseEvent) => {
      // Si el target es el propio dialog (y no sus hijos), es un clic en el fondo
      if (event.target === dialogElement) {
        onClose();
      }
    };

    if (dialogElement) {
      dialogElement.addEventListener("mousedown", handleMouseDown);
    }
    return () => {
      if (dialogElement) {
        dialogElement.removeEventListener("mousedown", handleMouseDown);
      }
    };
  }, [isOpen, onClose]);

  // 3.3. Rellena el formulario cuando cambia la tarea seleccionada y pone el foco
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setIsDone(task.is_done);

      // Pequeño timeout para asegurar que el input ya está renderizado
      setTimeout(() => {
        dialogRef.current?.querySelector("input")?.focus();
      }, 10);
    }
  }, [task, isOpen]);

  /* 4. Manejadores de Eventos */

  // Guarda los cambios en el store y cierra el modal
  const handleSave = () => {
    if (!task) return;
    if (title.trim() === "") return; // Validación básica: título obligatorio

    editCard(task.id, title, isDone, description);

    onClose();
  };

  // Maneja atajos de teclado dentro del modal
  const handleKeyDown = (e: KeyboardEvent<HTMLDialogElement>) => {
    if (e.key === "Enter") {
      // Permite saltos de línea normales en el textarea
      if ((e.target as HTMLElement).tagName.toLowerCase() === "textarea") {
        return;
      }
      // En otros inputs, Enter guarda el formulario
      e.preventDefault();
      handleSave();
    }
  };

  // Si no hay tarea seleccionada, no renderizar nada
  if (!task) {
    return null;
  }

  /* 5. Renderizado */
  return (
    <dialog
      ref={dialogRef}
      onClose={onClose} // Maneja cierre nativo (ej. tecla ESC)
      onKeyDown={handleKeyDown}
      className="bg-transparent overflow-visible rounded-none m-auto"
    >
      {/* 5.1. Contenedor Principal */}
      <div className="p-6 bg-zinc-800 rounded-lg shadow-xl w-[50vw] max-h-[90vh] overflow-y-auto hide-scrollbar text-white">
        <h2 className="text-2xl font-bold mb-4">Editar Tarea</h2>

        {/* 5.2. Campos de Edición */}
        <div className="flex flex-col gap-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título"
            className="bg-zinc-700 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={100}
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción (opcional)"
            rows={5}
            maxLength={1000}
            className="bg-zinc-700 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>

        {/* 5.3. Checkbox de Estado */}
        <div className="flex items-center gap-2 mt-4 text-sm">
          <input
            type="checkbox"
            id="isDone"
            checked={isDone}
            onChange={(e) => setIsDone(e.target.checked)}
            className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
          />
          <label htmlFor="isDone" className="text-zinc-300 cursor-pointer">
            Completada
          </label>
        </div>

        {/* 5.4. Botones de Acción */}
        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="bg-zinc-600 hover:bg-zinc-700 py-2 px-4 rounded cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded cursor-pointer"
          >
            Guardar
          </button>
        </div>
      </div>
    </dialog>
  );
}
