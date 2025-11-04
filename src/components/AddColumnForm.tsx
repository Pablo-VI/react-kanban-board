// src/components/AddColumnForm.tsx
import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { useBoardStore } from "../store";

export function AddColumnForm() {
  const addColumn = useBoardStore((state) => state.addColumn);
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const formRef = useRef<HTMLDivElement>(null); // Ref para el div del formulario

  const handleSubmit = () => {
    if (title.trim() !== "") {
      addColumn(title);
      setTitle("");
      setIsAdding(false);
    }
  };

  // Función de cancelar reutilizable
  const handleCancel = () => {
    setIsAdding(false);
    setTitle("");
  };

  // 👇 AÑADIDO: Efecto para detectar clic afuera
  useEffect(() => {
    // Si el formulario no está abierto, no hacemos nada
    if (!isAdding) return;

    const handleClickOutside = (event: MouseEvent) => {
      // Si el ref existe y el clic fue fuera del elemento del ref
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        handleCancel();
      }
    };

    // Añadimos el listener al documento
    document.addEventListener("mousedown", handleClickOutside);
    // Limpiamos el listener al desmontar o cuando 'isAdding' cambie
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAdding]); // Se ejecuta cada vez que 'isAdding' cambia

  // 👇 MODIFICADO: Manejador de teclado para Enter y Escape
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
        className="w-72 flex-shrink-0 bg-zinc-800/50 hover:bg-zinc-800/80 text-white font-bold px-4 rounded h-[76px] flex items-center justify-center"
      >
        + Añadir otra columna
      </button>
    );
  }

  return (
    <div
      ref={formRef} // <-- AÑADIDO: Asignamos el ref al div
      className="w-72 flex-shrink-0 bg-zinc-900 p-3 rounded-md h-[112px] flex flex-col justify-between"
    >
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown} // <-- MODIFICADO: Usamos el nuevo manejador
        placeholder="Introduce el título de la columna..."
        autoFocus
        className="bg-zinc-700 text-white p-2 rounded w-full mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        maxLength={40}
      />
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Añadir
        </button>
        <button
          onClick={handleCancel} // <-- MODIFICADO: Usamos la función de cancelar
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
