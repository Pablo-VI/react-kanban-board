// src/App.tsx
import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";
import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Column } from "./components/Column";
import { AddColumnForm } from "./components/AddColumnForm";
import { arrayMove } from "@dnd-kit/sortable";
import {
  useBoardStore,
  type Card as CardType,
  type Column as ColumnType,
} from "./store";
import { TaskModal } from "./components/TaskModal";
import { Card } from "./components/Card";
import { AuthPage } from "./components/AuthPage";
import { DeleteConfirmationModal } from "./components/DeleteConfirmationModal";
import type { Session } from "@supabase/supabase-js";
import { Toaster, toast } from "react-hot-toast";

function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const loginEvent = sessionStorage.getItem("login_event");
      const hasOAuthHash = window.location.hash.includes("access_token");
      const logoutEvent = sessionStorage.getItem("logout_event");

      if (
        event === "SIGNED_IN" &&
        session &&
        (loginEvent === "true" || hasOAuthHash)
      ) {
        toast.success(`Bienvenido.`);
        if (loginEvent) {
          sessionStorage.removeItem("login_event");
        }
        if (hasOAuthHash) {
          window.history.replaceState(null, "", window.location.pathname);
        }
      }

      if (event === "SIGNED_OUT" && logoutEvent === "true") {
        toast.success("Has cerrado sesión. ¡Hasta pronto!");
        sessionStorage.removeItem("logout_event");
      }

      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <Toaster
        position="bottom-right"
        reverseOrder={false}
        toastOptions={{
          style: {
            background: "#333",
            color: "#fff",
          },
        }}
      />
      {!session ? <AuthPage /> : <Board key={session.user.id} />}
    </>
  );
}

function Board() {
  const fetchBoard = useBoardStore((state) => state.fetchBoard);
  const columns = useBoardStore((state) => state.columns);
  const setColumns = useBoardStore((state) => state.setColumns);
  const _updateCardOrders = useBoardStore((state) => state._updateCardOrders);

  const lastLocalUpdateRef = useRef<number>(0);

  const [originalColumns, setOriginalColumns] = useState(columns);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<CardType | null>(null);
  const [activeCard, setActiveCard] = useState<
    (CardType & { columnId: string }) | null
  >(null);
  const deleteColumn = useBoardStore((state) => state.deleteColumn);
  const renameColumn = useBoardStore((state) => state.renameColumn);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [columnToDelete, setColumnToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  useEffect(() => {
    const channel = supabase
      .channel("realtime-kanban")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cards" },
        () => {
          if (Date.now() - lastLocalUpdateRef.current < 3000) {
            return;
          }
          fetchBoard();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "columns" },
        () => {
          if (Date.now() - lastLocalUpdateRef.current < 3000) {
            return;
          }
          fetchBoard();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchBoard]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleOpenEditModal = (task: CardType) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const columnId = active.data.current?.columnId as string;
    const card = columns
      .flatMap((col) => col.cards)
      .find((c) => c.id === active.id);
    if (card && columnId) {
      setActiveCard({ ...card, columnId });
    }
    setOriginalColumns(columns);
  };

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const isActiveACard = active.data.current?.type === "Card";
    if (!isActiveACard) return;

    const sourceColumnId = active.data.current?.columnId as string;
    const overIsColumn = over.data.current?.type === "Column";
    const destColumnId = overIsColumn
      ? (over.id as string)
      : (over.data.current?.columnId as string);

    if (sourceColumnId === destColumnId) return;

    const currentColumns = useBoardStore.getState().columns;
    const newColumns = JSON.parse(
      JSON.stringify(currentColumns)
    ) as ColumnType[];

    const sourceColIndex = newColumns.findIndex(
      (c: ColumnType) => c.id === sourceColumnId
    );
    const destColIndex = newColumns.findIndex(
      (c: ColumnType) => c.id === destColumnId
    );

    if (sourceColIndex === -1 || destColIndex === -1) return;

    const sourceCards = newColumns[sourceColIndex].cards;
    const destCards = newColumns[destColIndex].cards;

    const activeCardIndex = sourceCards.findIndex((c) => c.id === activeId);
    if (activeCardIndex === -1) return;

    const [movedCard] = sourceCards.splice(activeCardIndex, 1);
    destCards.push(movedCard);

    setColumns(newColumns);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveCard(null);
    const { active, over } = event;

    if (!over) {
      setColumns(originalColumns);
      return;
    }

    const sourceColumnId = active.data.current?.columnId as string;
    const overIsColumn = over.data.current?.type === "Column";
    const destColumnId = overIsColumn
      ? (over.id as string)
      : (over.data.current?.columnId as string);
    const activeId = active.id as string;
    const overId = over.id as string;

    const sourceCol = columns.find((c: ColumnType) => c.id === sourceColumnId);
    const destCol = columns.find((c: ColumnType) => c.id === destColumnId);

    if (!sourceCol || !destCol) {
      setColumns(originalColumns);
      return;
    }

    const sourceCardIndex = sourceCol.cards.findIndex((c) => c.id === activeId);
    let destCardIndex;
    if (over.data.current?.type === "Card") {
      destCardIndex = destCol.cards.findIndex((c) => c.id === overId);
    } else {
      destCardIndex = destCol.cards.length;
    }

    const newColumns = JSON.parse(JSON.stringify(columns)) as ColumnType[];

    if (sourceColumnId === destColumnId) {
      const colIndex = newColumns.findIndex(
        (c: ColumnType) => c.id === sourceColumnId
      );
      if (sourceCardIndex !== -1 && destCardIndex !== -1) {
        const newCards = arrayMove(
          newColumns[colIndex].cards,
          sourceCardIndex,
          destCardIndex
        );
        newColumns[colIndex] = { ...newColumns[colIndex], cards: newCards };
      }
    } else {
      const sourceColIndex = newColumns.findIndex(
        (c: ColumnType) => c.id === sourceColumnId
      );
      const destColIndex = newColumns.findIndex(
        (c: ColumnType) => c.id === destColumnId
      );

      if (sourceColIndex !== -1 && sourceCardIndex !== -1) {
        const [movedCard] = newColumns[sourceColIndex].cards.splice(
          sourceCardIndex,
          1
        );
        newColumns[destColIndex].cards.splice(destCardIndex, 0, movedCard);
      }
    }

    setColumns(newColumns);

    lastLocalUpdateRef.current = Date.now();

    const cardsToUpdate: {
      id: string;
      card_order: number;
      column_id: number;
    }[] = [];
    const updatedSourceCol = newColumns.find(
      (c: ColumnType) => c.id === sourceColumnId
    )!;
    updatedSourceCol.cards.forEach((card, index) => {
      cardsToUpdate.push({
        id: card.id,
        card_order: index,
        column_id: parseInt(sourceColumnId),
      });
    });

    if (sourceColumnId !== destColumnId) {
      const updatedDestCol = newColumns.find(
        (c: ColumnType) => c.id === destColumnId
      )!;
      updatedDestCol.cards.forEach((card, index) => {
        if (!cardsToUpdate.some((c) => c.id === card.id)) {
          cardsToUpdate.push({
            id: card.id,
            card_order: index,
            column_id: parseInt(destColumnId),
          });
        }
      });
    }
    _updateCardOrders(cardsToUpdate);
  }

  const handleOpenDeleteModal = (columnId: string, columnTitle: string) => {
    setColumnToDelete({ id: columnId, title: columnTitle });
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setColumnToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (columnToDelete) {
      await deleteColumn(columnToDelete.id);
      handleCloseDeleteModal();
    }
  };

  const handleSignOut = async () => {
    sessionStorage.setItem("logout_event", "true");
    const { error } = await supabase.auth.signOut();
    if (error) {
      sessionStorage.removeItem("logout_event");
      toast.error("Error al cerrar sesión: " + error.message);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="bg-zinc-950 text-white min-h-screen flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-8 pb-0 flex-shrink-0">
          <h1 className="text-3xl font-bold">Mi tablero</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={handleSignOut}
              className="border border-zinc-700 
         hover:bg-red-700 hover:border-transparent 
         text-white font-bold py-2 px-4 rounded cursor-pointer"
            >
              Cerrar Sesión
            </button>
          </div>
        </header>

        <main className="flex gap-6 items-start flex-grow p-8 pt-8 overflow-x-auto hide-scrollbar">
          {columns.map((column) => (
            <Column
              key={column.id}
              id={column.id}
              title={column.title}
              cards={column.cards}
              onCardClick={handleOpenEditModal}
              overColumnId={null}
              onDeleteColumn={handleOpenDeleteModal}
              onRenameColumn={renameColumn}
            />
          ))}
          <AddColumnForm />
        </main>
      </div>

      <DragOverlay>
        {activeCard ? (
          <Card
            card={activeCard}
            isActive={true}
            onClick={() => {}}
            columnId={activeCard.columnId}
          />
        ) : null}
      </DragOverlay>
      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        task={editingTask}
      />
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        itemName={columnToDelete?.title || ""}
      />
    </DndContext>
  );
}

export default App;
