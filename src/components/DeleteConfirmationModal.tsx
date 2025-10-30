import { useEffect, useRef } from "react";

type DeleteConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string; // El nombre de lo que se va a borrar (ej: "Columna 1")
};

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  itemName,
}: DeleteConfirmationModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  // Lógica para cerrar al hacer clic fuera (backdrop)
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

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="p-6 bg-zinc-800 rounded-lg shadow-xl w-full max-w-md text-white"
    >
      <h2 className="text-xl font-bold mb-4">Confirmar Eliminación</h2>
      <p className="mb-6">
        ¿Estás seguro de que quieres eliminar la columna{" "}
        <strong className="font-bold text-red-400">"{itemName}"</strong>? Esta
        acción no se puede deshacer.
      </p>
      <div className="flex justify-end gap-4">
        <button
          onClick={onClose}
          className="bg-zinc-600 hover:bg-zinc-700 py-2 px-4 rounded transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          className="bg-red-600 hover:bg-red-700 py-2 px-4 rounded transition-colors"
        >
          Eliminar
        </button>
      </div>
    </dialog>
  );
}
