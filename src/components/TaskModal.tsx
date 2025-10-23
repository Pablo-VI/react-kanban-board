// src/components/TaskModal.tsx
import { useEffect, useState, useRef } from "react";
import { useBoardStore, type Card, type Column } from "../store"; // Importa el tipo Column

type TaskModalProps = {
  isOpen: boolean;
  onClose: () => void;
  task: Card | null;
  initialColumnId: string; // Renombrado para mayor claridad
  columns: Column[]; // <-- AÑADIDO: Recibimos todas las columnas
};

export function TaskModal({
  isOpen,
  onClose,
  task,
  initialColumnId,
  columns,
}: TaskModalProps) {
  const { addCard, editCard } = useBoardStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  // AÑADIDO: Nuevo estado para la columna seleccionada
  const [selectedColumnId, setSelectedColumnId] = useState(initialColumnId);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
    } else {
      // Al crear, reseteamos y establecemos la columna por defecto
      setTitle("");
      setDescription("");
      setSelectedColumnId(initialColumnId);
    }
  }, [task, isOpen, initialColumnId]);

  const handleSave = () => {
    if (title.trim() === "") return;
    if (task) {
      editCard(task.id, title, description);
    } else {
      // CAMBIADO: Usamos el ID de la columna seleccionada
      addCard(selectedColumnId, title, description);
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

        {/* 👇 ¡AQUÍ ESTÁ LA MAGIA! El nuevo selector 👇 */}
        {!task && (
          <div>
            <label
              htmlFor="column-select"
              className="block text-sm font-medium text-zinc-400 mb-1"
            >
              Columna
            </label>
            <select
              id="column-select"
              value={selectedColumnId}
              onChange={(e) => setSelectedColumnId(e.target.value)}
              className="bg-zinc-700 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {columns.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.title}
                </option>
              ))}
            </select>
          </div>
        )}
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
