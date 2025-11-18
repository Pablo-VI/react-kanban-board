// src/components/AddColumnForm.tsx
import {
  useState,
  useRef,
  useEffect,
  type KeyboardEvent,
  useCallback,
} from "react";
import { useBoardStore } from "../store";

export function AddColumnForm() {
  const addColumn = useBoardStore((state) => state.addColumn);
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const formRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    // ... (sin cambios)
    if (title.trim() === "" || isLoading) return;

    setIsLoading(true);
    const success = await addColumn(title);
    setIsLoading(false);

    if (success) {
      setTitle("");
      setIsAdding(false);
    }
  };

  const handleCancel = useCallback(() => {
    if (isLoading) return;
    setIsAdding(false);
    setTitle("");
  }, [isLoading]);

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

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="w-72 flex-shrink-0 bg-zinc-800/50 hover:bg-zinc-800/80 text-white font-bold px-4 rounded h-[76px] flex items-center justify-center cursor-pointer"
      >
        + Añadir otra columna
      </button>
    );
  }

  return (
    <div
      ref={formRef}
      className="w-72 flex-shrink-0 bg-zinc-900 p-3 rounded-md h-[112px] flex flex-col justify-between"
    >
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Introduce el título de la columna..."
        autoFocus
        className="bg-zinc-700 text-white p-2 rounded w-full mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        maxLength={40}
        disabled={isLoading}
      />
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 cursor-pointer"
          disabled={isLoading}
        >
          {isLoading ? "Añadiendo..." : "Añadir"}
        </button>
        <button
          onClick={handleCancel}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 cursor-pointer"
          disabled={isLoading}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
