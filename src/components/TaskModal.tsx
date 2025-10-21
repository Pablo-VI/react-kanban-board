// src/components/TaskModal.tsx
import { useEffect, useState, useRef } from "react";
import { useBoardStore, type Card } from "../store";

type TaskModalProps = {
  isOpen: boolean;
  onClose: () => void;
  task: Card | null;
  columnId: string;
};

export function TaskModal({ isOpen, onClose, task, columnId }: TaskModalProps) {
  const { addCard, editCard } = useBoardStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Sincroniza el estado del modal con el del componente
  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  // Rellena el formulario cuando se edita una tarea
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
    } else {
      // Resetea el formulario para crear una nueva tarea
      setTitle("");
      setDescription("");
    }
  }, [task, isOpen]);

  const handleSave = () => {
    if (title.trim() === "") return;
    if (task) {
      // Modo Edición
      editCard(columnId, task.id, title, description);
    } else {
      // Modo Creación
      addCard(columnId, title, description);
    }
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="p-6 bg-zinc-800 rounded-lg shadow-xl w-full max-w-md text-white"
    >
      <h2 className="text-2xl font-bold mb-4">
        {task ? "Editar Tarea" : "Crear Nueva Tarea"}
      </h2>
      <div className="flex flex-col gap-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título"
          className="bg-zinc-700 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción (opcional)"
          rows={4}
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
    </dialog>
  );
}
