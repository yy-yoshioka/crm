'use client';

import { useState, useCallback, useEffect } from 'react';

export type OptimisticUpdateOptions<T> = {
  /**
   * Function that performs the actual data update
   */
  updateFn: (data: T) => Promise<void>;

  /**
   * Function that rolls back optimistic changes if API call fails
   */
  rollbackFn?: () => void;

  /**
   * Callback executed when update is successful
   */
  onSuccess?: () => void;

  /**
   * Callback executed when update fails
   */
  onError?: (error: unknown) => void;

  /**
   * Whether to disable optimistic updates
   */
  disableOptimistic?: boolean;
};

/**
 * Hook for performing optimistic updates in UI
 *
 * @example
 * ```tsx
 * // Simple usage
 * const { isPending, execute } = useOptimisticUpdate({
 *   updateFn: async (newStatus) => {
 *     await apiClient.updateStatus(id, newStatus);
 *   }
 * });
 *
 * // With optimistic UI update and rollback on error
 * const [todos, setTodos] = useState([]);
 * const { isPending, execute } = useOptimisticUpdate({
 *   updateFn: async (newTodo) => {
 *     await apiClient.createTodo(newTodo);
 *   },
 *   rollbackFn: () => {
 *     // This runs if the API call fails
 *     setTodos(todos.filter(t => t.id !== 'temp-id'));
 *   },
 *   onSuccess: () => {
 *     // This runs if the API call succeeds
 *     toast.success('Todo created!');
 *   }
 * });
 *
 * const addTodo = (text) => {
 *   // Optimistically update UI before API call
 *   const tempTodo = { id: 'temp-id', text, completed: false };
 *   setTodos([...todos, tempTodo]);
 *
 *   // Execute the update with automatic rollback on failure
 *   execute(tempTodo);
 * };
 * ```
 */
export function useOptimisticUpdate<T>({
  updateFn,
  rollbackFn,
  onSuccess,
  onError,
  /* Unused parameter: disableOptimistic = false, */
}: OptimisticUpdateOptions<T>) {
  const [isPending, setIsPending] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [pendingData, setPendingData] = useState<T | null>(null);

  // Reset error when cleanup happens
  useEffect(() => {
    return () => {
      setIsError(false);
      setError(null);
    };
  }, []);

  /**
   * Execute the update with optimistic UI changes
   */
  const execute = useCallback(
    async (data: T) => {
      setIsPending(true);
      setIsError(false);
      setError(null);
      setPendingData(data);

      try {
        await updateFn(data);
        setIsPending(false);
        setPendingData(null);
        if (onSuccess) {
          onSuccess();
        }
      } catch (err) {
        console.error('Optimistic update failed:', err);
        setIsError(true);
        setError(err);
        setIsPending(false);
        setPendingData(null);

        // If the update fails, roll back the optimistic update
        if (rollbackFn) {
          rollbackFn();
        }

        if (onError) {
          onError(err);
        }
      }
    },
    [updateFn, rollbackFn, onSuccess, onError]
  );

  return {
    isPending,
    isError,
    error,
    pendingData,
    execute,
  };
}

/**
 * Hook for optimistic list operations with automatic rollback
 *
 * @example
 * ```tsx
 * // Using the hook with a list of items
 * const [items, setItems] = useState([
 *   { id: 1, text: 'Item 1', completed: false },
 *   { id: 2, text: 'Item 2', completed: true }
 * ]);
 *
 * const {
 *   addItem,
 *   updateItem,
 *   removeItem,
 *   pendingItems,
 *   isPending
 * } = useOptimisticList({
 *   items,
 *   setItems,
 *   idField: 'id',
 *   apis: {
 *     add: (item) => api.createItem(item),
 *     update: (id, item) => api.updateItem(id, item),
 *     remove: (id) => api.deleteItem(id)
 *   },
 *   onError: (error) => toast.error(`Operation failed: ${error.message}`)
 * });
 *
 * // Add a new item optimistically
 * const handleAdd = () => {
 *   addItem({ text: 'New item', completed: false });
 * };
 *
 * // Update an item optimistically
 * const handleToggle = (id) => {
 *   const item = items.find(i => i.id === id);
 *   updateItem(id, { ...item, completed: !item.completed });
 * };
 *
 * // Remove an item optimistically
 * const handleDelete = (id) => {
 *   removeItem(id);
 * };
 * ```
 */
export function useOptimisticList<T extends Record<string, unknown>>({
  items,
  setItems,
  idField = 'id',
  apis,
  onSuccess,
  onError,
}: {
  items: T[];
  setItems: React.Dispatch<React.SetStateAction<T[]>>;
  idField?: string;
  apis: {
    add?: (item: Omit<T, typeof idField>) => Promise<T>;
    update?: (id: string | number, item: Partial<T>) => Promise<T>;
    remove?: (id: string | number) => Promise<void>;
  };
  onSuccess?: (operation: 'add' | 'update' | 'remove', item?: T) => void;
  onError?: (error: unknown, operation: 'add' | 'update' | 'remove') => void;
}) {
  const [pendingOperations, setPendingOperations] = useState<
    Array<{
      type: 'add' | 'update' | 'remove';
      id: string | number | 'temp';
      originalItems: T[];
    }>
  >([]);

  // Add an item optimistically
  const addItem = useCallback(
    async (newItem: Omit<T, typeof idField>) => {
      if (!apis.add) {
        throw new Error('Add API not provided');
      }

      // Create temporary ID
      const tempId = `temp-${Date.now()}`;

      // Create a temporary item with the temp ID
      const tempItem = {
        ...newItem,
        [idField]: tempId,
        __optimistic: true,
      } as unknown as T;

      // Store original items for rollback
      const originalItems = [...items];

      // Update UI optimistically
      setItems(current => [...current, tempItem]);

      // Track this operation
      setPendingOperations(ops => [
        ...ops,
        { type: 'add', id: tempId, originalItems },
      ]);

      try {
        // Perform actual API call
        const createdItem = await apis.add(newItem);

        // Replace temporary item with real one
        setItems(current =>
          current.map(item =>
            item[idField] === tempId ? { ...createdItem } : item
          )
        );

        // Remove from pending operations
        setPendingOperations(ops =>
          ops.filter(op => !(op.type === 'add' && op.id === tempId))
        );

        if (onSuccess) {
          onSuccess('add', createdItem);
        }

        return createdItem;
      } catch (error) {
        console.error('Error adding item:', error);

        // Roll back to original state
        setItems(originalItems);

        // Remove from pending operations
        setPendingOperations(ops =>
          ops.filter(op => !(op.type === 'add' && op.id === tempId))
        );

        if (onError) {
          onError(error, 'add');
        }

        throw error;
      }
    },
    [items, idField, apis, setItems, onSuccess, onError]
  );

  // Update an item optimistically
  const updateItem = useCallback(
    async (id: string | number, updates: Partial<T>) => {
      if (!apis.update) {
        throw new Error('Update API not provided');
      }

      // Store original items for rollback
      const originalItems = [...items];

      // Update UI optimistically
      setItems(current =>
        current.map(item =>
          item[idField] === id
            ? { ...item, ...updates, __optimistic: true }
            : item
        )
      );

      // Track this operation
      setPendingOperations(ops => [
        ...ops,
        { type: 'update', id, originalItems },
      ]);

      try {
        // Perform actual API call
        const updatedItem = await apis.update(id, updates);

        // Replace optimistic item with real one
        setItems(current =>
          current.map(item =>
            item[idField] === id ? { ...updatedItem } : item
          )
        );

        // Remove from pending operations
        setPendingOperations(ops =>
          ops.filter(op => !(op.type === 'update' && op.id === id))
        );

        if (onSuccess) {
          onSuccess('update', updatedItem);
        }

        return updatedItem;
      } catch (error) {
        console.error(`Error updating item with id ${id}:`, error);

        // Roll back to original state
        setItems(originalItems);

        // Remove from pending operations
        setPendingOperations(ops =>
          ops.filter(op => !(op.type === 'update' && op.id === id))
        );

        if (onError) {
          onError(error, 'update');
        }

        throw error;
      }
    },
    [items, idField, apis, setItems, onSuccess, onError]
  );

  // Remove an item optimistically
  const removeItem = useCallback(
    async (id: string | number) => {
      if (!apis.remove) {
        throw new Error('Remove API not provided');
      }

      // Store original items for rollback
      const originalItems = [...items];

      // Update UI optimistically
      setItems(current => current.filter(item => item[idField] !== id));

      // Track this operation
      setPendingOperations(ops => [
        ...ops,
        { type: 'remove', id, originalItems },
      ]);

      try {
        // Perform actual API call
        await apis.remove(id);

        // Remove from pending operations
        setPendingOperations(ops =>
          ops.filter(op => !(op.type === 'remove' && op.id === id))
        );

        if (onSuccess) {
          onSuccess('remove');
        }
      } catch (error) {
        console.error(`Error removing item with id ${id}:`, error);

        // Roll back to original state
        setItems(originalItems);

        // Remove from pending operations
        setPendingOperations(ops =>
          ops.filter(op => !(op.type === 'remove' && op.id === id))
        );

        if (onError) {
          onError(error, 'remove');
        }

        throw error;
      }
    },
    [items, idField, apis, setItems, onSuccess, onError]
  );

  // Identify pending items
  const pendingItems = items.filter(item => item.__optimistic);
  const isPending = pendingOperations.length > 0;

  return {
    addItem,
    updateItem,
    removeItem,
    pendingItems,
    isPending,
    pendingOperations,
  };
}
