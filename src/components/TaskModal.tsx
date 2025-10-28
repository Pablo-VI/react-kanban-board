// src/components/TaskModal.tsx
import { useEffect, useState, useRef } from "react";
import { useBoardStore, type Card, type Column } from "../store";

type TaskModalProps = {
  isOpen: boolean;
  onClose: () => void;
  task: Card | null;
  initialColumnId: string;
  columns: Column[];
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
  const [selectedColumnId, setSelectedColumnId] = useState(initialColumnId);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // 1. Efecto para abrir/cerrar el modal (se mantiene igual)
  useEffect(() => {
    if (isOpen) {
      // El showModal() es necesario para el backdrop nativo
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  // 2. EFECTO CORREGIDO: Cierre al hacer clic en el backdrop
  useEffect(() => {
    const dialogElement = dialogRef.current;

    // Esta función maneja el clic en cualquier parte de la ventana
    const handleMouseDown = (event: MouseEvent) => {
      // Solo nos interesa el clic si el modal está abierto
      if (!dialogElement || !isOpen) return;

      // Usamos el `target` para verificar el elemento clicado.
      // Si el elemento clicado es el propio <dialog> (el área oscura), lo cerramos.
      // Si el clic es dentro del contenido, no lo cerramos.
      if (event.target === dialogElement) {
        onClose();
      }
    };

    // Usamos 'mousedown' en el elemento del diálogo
    if (dialogElement) {
      dialogElement.addEventListener("mousedown", handleMouseDown);
    }

    // Limpieza: quitamos el oyente al desmontar o cerrar
    return () => {
      if (dialogElement) {
        dialogElement.removeEventListener("mousedown", handleMouseDown);
      }
    };
    // Reajustamos las dependencias
  }, [isOpen, onClose]);

  // 3. Efecto para rellenar/resetear el formulario (se mantiene igual)
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
    } else {
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
      addCard(selectedColumnId, title, description);
    }
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      // Importante: No uses la clase 'bg-zinc-800' en el <dialog> si quieres que el backdrop
      // sea el área clicable. En este caso, la clase debe ir en un contenedor interno.
      // Sin embargo, mantendremos la clase aquí por simplicidad de diseño:
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

        {/* Selector de columna */}
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
