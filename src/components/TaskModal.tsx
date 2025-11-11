// src/components/TaskModal.tsx
import { useEffect, useState, useRef, type KeyboardEvent } from "react";
import { useBoardStore, type Card } from "../store";

type TaskModalProps = {
  isOpen: boolean;
  onClose: () => void;
  task: Card | null;
};

export function TaskModal({ isOpen, onClose, task }: TaskModalProps) {
  const { editCard } = useBoardStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);

  // ... (useEffect de show/close no cambia)
  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  // ... (useEffect de backdrop click no cambia)
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

  // ... (useEffect de rellenar datos no cambia)
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setTimeout(() => {
        dialogRef.current?.querySelector("input")?.focus();
      }, 10);
    }
  }, [task, isOpen]);

  // ... (handleSave y handleKeyDown no cambian)
  const handleSave = () => {
    if (!task) return;
    if (title.trim() === "") return;
    editCard(task.id, title, description);
    onClose();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDialogElement>) => {
    if (e.key === "Enter") {
      if ((e.target as HTMLElement).tagName.toLowerCase() === "textarea") {
        return;
      }
      e.preventDefault();
      handleSave();
    }
  };

  if (!task) {
    return null;
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onKeyDown={handleKeyDown}
      className="bg-transparent overflow-visible rounded-none m-auto"
    >
      <div className="p-6 bg-zinc-800 rounded-lg shadow-xl w-[50vw] max-h-[90vh] overflow-y-auto hide-scrollbar text-white">
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
            rows={5}
            className="bg-zinc-700 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
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
