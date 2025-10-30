// src/components/AddColumnForm.tsx
import { useState } from "react";
import { useBoardStore } from "../store";

export function AddColumnForm() {
  const addColumn = useBoardStore((state) => state.addColumn);
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");

  const handleSubmit = () => {
    if (title.trim() !== "") {
      addColumn(title);
      setTitle("");
      setIsAdding(false);
    }
  };

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="w-72 flex-shrink-0 bg-zinc-800/50 hover:bg-zinc-800/80 text-white font-bold px-4 rounded h-[76px] flex items-center justify-center"
      >
        + Añadir otra columna
      </button>
    );
  }

  return (
    <div className="w-72 flex-shrink-0 bg-zinc-900 p-3 rounded-md h-[112px] flex flex-col justify-between">
      {" "}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        placeholder="Introduce el título de la columna..."
        autoFocus
        className="bg-zinc-700 text-white p-2 rounded w-full mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Añadir
        </button>
        <button
          onClick={() => setIsAdding(false)}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
