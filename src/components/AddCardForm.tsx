// src/components/AddCardForm.tsx
import {
  useState,
  useRef,
  useEffect,
  type KeyboardEvent,
  useCallback,
} from "react";
import { useBoardStore } from "../store";

type AddCardFormProps = {
  columnId: string;
};

export function AddCardForm({ columnId }: AddCardFormProps) {
  const addCard = useBoardStore((state) => state.addCard);
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const formRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (title.trim() === "" || isLoading) return;

    setIsLoading(true);
    const success = await addCard(columnId, title);
    setIsLoading(false);

    if (success) {
      setTitle("");
      textareaRef.current?.focus();
    }
  };

  const handleCancel = useCallback(() => {
    if (isLoading) return;
    setIsAdding(false);
    setTitle("");
  }, [isLoading]);

  useEffect(() => {
    if (isAdding) {
      textareaRef.current?.focus();
    }
  }, [isAdding]);

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

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="w-full text-left p-2.5 mb-3 text-zinc-400 hover:text-white hover:bg-zinc-700/70 rounded-md transition-colors"
      >
        + Añade una tarjeta
      </button>
    );
  }

  return (
    <div ref={formRef} className="flex flex-col gap-2">
      <textarea
        ref={textareaRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Introduce un título para esta tarjeta..."
        rows={3}
        className="bg-zinc-700 text-white p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none shadow-inner"
        disabled={isLoading}
      />
      <div className="flex gap-2 items-center">
        <button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? "..." : "Añadir tarjeta"}
        </button>
        <button
          onClick={handleCancel}
          className="text-gray-400 hover:text-white disabled:opacity-50"
          aria-label="Cancelar"
          disabled={isLoading}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
