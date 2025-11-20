// src/components/DeleteConfirmationModal.tsx

/**
 * ÍNDICE DE CONTENIDOS
 * ------------------------------------------------------------------
 * 1. Importaciones y Tipos
 * 2. Definición del Componente
 * 3. Efectos Secundarios
 * 3.1. Sincronización del Estado (Open/Close)
 * 3.2. Manejador de Clic en Backdrop (Fondo)
 * 4. Renderizado
 * ------------------------------------------------------------------
 */

/* 1. Importaciones y Tipos */
import { useEffect, useRef } from "react";

type DeleteConfirmationModalProps = {
  isOpen: boolean; // Controla la visibilidad del modal
  onClose: () => void; // Callback para cerrar (Cancelar)
  onConfirm: () => void; // Callback para confirmar la acción (Eliminar)
  itemName: string; // Nombre del elemento a eliminar (para el mensaje)
};

/* 2. Definición del Componente */
export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  itemName,
}: DeleteConfirmationModalProps) {
  // Referencia al elemento nativo <dialog>
  const dialogRef = useRef<HTMLDialogElement>(null);

  /* 3. Efectos Secundarios */

  // 3.1. Sincronización: Abre o cierra el <dialog> nativo según la prop 'isOpen'
  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal(); // Abre como modal (bloquea el fondo)
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  // 3.2. Manejador de Clic en Backdrop: Cierra el modal si se hace clic fuera del contenido
  useEffect(() => {
    const dialogElement = dialogRef.current;

    const handleMouseDown = (event: MouseEvent) => {
      // Si el objetivo del clic es el propio elemento <dialog>, significa que
      // se hizo clic en el "backdrop" (fondo oscuro), no en el div interno.
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

  /* 4. Renderizado */
  return (
    <dialog
      ref={dialogRef}
      onClose={onClose} // Maneja el cierre nativo (ej. tecla ESC)
      className="bg-transparent overflow-visible rounded-none m-auto"
    >
      <div className="p-6 bg-zinc-800 rounded-lg shadow-xl w-full max-w-md text-white">
        <h2 className="text-xl font-bold mb-4">Confirmar Eliminación</h2>

        <p className="mb-6">
          ¿Estás seguro de que quieres eliminar la columna{" "}
          <strong className="font-bold text-red-400">"{itemName}"</strong>?
          <br /> {/* Salto de línea para énfasis */}
          Esta acción no se puede deshacer.
        </p>

        <div className="flex justify-end gap-4">
          {/* Botón Cancelar */}
          <button
            onClick={onClose}
            className="bg-zinc-600 hover:bg-zinc-700 py-2 px-4 rounded transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          {/* Botón Eliminar */}
          <button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 py-2 px-4 rounded transition-colors cursor-pointer"
          >
            Eliminar
          </button>
        </div>
      </div>
    </dialog>
  );
}
