// src/components/TaskModal.tsx
import { useEffect, useState, useRef, type KeyboardEvent } from "react"; // Añadido KeyboardEvent
import { useBoardStore, type Card } from "../store"; // ❌ ELIMINADO: type Column

type TaskModalProps = {
  isOpen: boolean;
  onClose: () => void;
  task: Card | null;
  // ❌ ELIMINADAS: initialColumnId y columns
};

export function TaskModal({ isOpen, onClose, task }: TaskModalProps) {
  const { editCard } = useBoardStore(); // ❌ ELIMINADO: addCard
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  // ❌ ELIMINADO: selectedColumnId
  const dialogRef = useRef<HTMLDialogElement>(null);

  // ... (Efectos para showModal y backdrop click se mantienen) ...
  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const dialogElement = dialogRef.current;
    const handleMouseDown = (event: MouseEvent) => {
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

  // 👇 MODIFICACIÓN: Simplificado, solo se rellena si hay tarea
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      // Auto-focus al input
      setTimeout(() => {
        dialogRef.current?.querySelector("input")?.focus();
      }, 10);
    }
    // ❌ ELIMINADO: else (para crear)
  }, [task, isOpen]);

  // 👇 MODIFICACIÓN: Simplificado, solo edita
  const handleSave = () => {
    if (!task) return; // Guarda de seguridad
    if (title.trim() === "") return;

    editCard(task.id, title, description);
    onClose();
  };

  // Manejador de teclado
  const handleKeyDown = (e: KeyboardEvent<HTMLDialogElement>) => {
    if (e.key === "Enter") {
      if ((e.target as HTMLElement).tagName.toLowerCase() === "textarea") {
        return;
      }
      e.preventDefault();
      handleSave();
    }
  };

  // Guarda de seguridad por si 'task' es null
  if (!task) {
    return null;
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onKeyDown={handleKeyDown} // Añadido
      className="bg-transparent overflow-visible rounded-none"
    >
      <div className="p-6 bg-zinc-800 rounded-lg shadow-xl w-full max-w-md text-white">
        {/* 👇 MODIFICACIÓN: Título fijo */}
        <h2 className="text-2xl font-bold mb-4">Editar Tarea</h2>
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
            rows={4}
            className="bg-zinc-700 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>

          {/* ❌ ELIMINADO: Selector de columna */}
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="bg-zinc-600 hover:bg-zinc-700 py-2 px-4 rounded"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded"
          >
            Guardar
          </button>
        </div>
      </div>
    </dialog>
  );
}
