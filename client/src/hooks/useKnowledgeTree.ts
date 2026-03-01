import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

export function useKnowledgeTree(slug: string) {
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['brainlift', slug] });
  };

  // === Categories ===
  const createCategoryMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      const res = await fetch(`/api/brainlifts/${slug}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to create category');
      }
      return res.json();
    },
    onSuccess: invalidate,
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, ...fields }: { id: number; name?: string; sortOrder?: number }) => {
      const res = await fetch(`/api/brainlifts/${slug}/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to update category');
      }
      return res.json();
    },
    onSuccess: invalidate,
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/brainlifts/${slug}/categories/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to delete category');
      }
      return res.json();
    },
    onSuccess: invalidate,
  });

  // === Sources ===
  const createSourceMutation = useMutation({
    mutationFn: async (data: { categoryId: number; title: string; url?: string }) => {
      const { categoryId, ...body } = data;
      const res = await fetch(`/api/brainlifts/${slug}/categories/${categoryId}/sources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to create source');
      }
      return res.json();
    },
    onSuccess: invalidate,
  });

  const updateSourceMutation = useMutation({
    mutationFn: async ({ id, ...fields }: { id: number; title?: string; url?: string; categoryId?: number }) => {
      const res = await fetch(`/api/brainlifts/${slug}/sources/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to update source');
      }
      return res.json();
    },
    onSuccess: invalidate,
  });

  const deleteSourceMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/brainlifts/${slug}/sources/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to delete source');
      }
      return res.json();
    },
    onSuccess: invalidate,
  });

  // === Facts ===
  const createFactMutation = useMutation({
    mutationFn: async (data: { sourceId: number; text: string }) => {
      const { sourceId, ...body } = data;
      const res = await fetch(`/api/brainlifts/${slug}/sources/${sourceId}/facts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to create fact');
      }
      return res.json();
    },
    onSuccess: invalidate,
  });

  const updateFactMutation = useMutation({
    mutationFn: async ({ id, ...fields }: { id: number; text?: string }) => {
      const res = await fetch(`/api/brainlifts/${slug}/facts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to update fact');
      }
      return res.json();
    },
    onSuccess: invalidate,
  });

  const deleteFactMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/brainlifts/${slug}/facts/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to delete fact');
      }
      return res.json();
    },
    onSuccess: invalidate,
  });

  // === Summaries ===
  const createSummaryMutation = useMutation({
    mutationFn: async (data: { sourceId: number; text: string; relatedFactIds?: number[] }) => {
      const { sourceId, ...body } = data;
      const res = await fetch(`/api/brainlifts/${slug}/sources/${sourceId}/summaries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to create summary');
      }
      return res.json();
    },
    onSuccess: invalidate,
  });

  const updateSummaryMutation = useMutation({
    mutationFn: async ({ id, ...fields }: { id: number; text?: string; relatedFactIds?: number[] }) => {
      const res = await fetch(`/api/brainlifts/${slug}/summaries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to update summary');
      }
      return res.json();
    },
    onSuccess: invalidate,
  });

  const deleteSummaryMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/brainlifts/${slug}/summaries/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to delete summary');
      }
      return res.json();
    },
    onSuccess: invalidate,
  });

  return {
    createCategory: createCategoryMutation.mutateAsync,
    updateCategory: updateCategoryMutation.mutateAsync,
    deleteCategory: deleteCategoryMutation.mutateAsync,
    isCreatingCategory: createCategoryMutation.isPending,

    createSource: createSourceMutation.mutateAsync,
    updateSource: updateSourceMutation.mutateAsync,
    deleteSource: deleteSourceMutation.mutateAsync,
    isCreatingSource: createSourceMutation.isPending,

    createFact: createFactMutation.mutateAsync,
    updateFact: updateFactMutation.mutateAsync,
    deleteFact: deleteFactMutation.mutateAsync,
    isCreatingFact: createFactMutation.isPending,

    createSummary: createSummaryMutation.mutateAsync,
    updateSummary: updateSummaryMutation.mutateAsync,
    deleteSummary: deleteSummaryMutation.mutateAsync,
    isCreatingSummary: createSummaryMutation.isPending,
  };
}
