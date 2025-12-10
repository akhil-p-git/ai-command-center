import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { knowledgeApi } from '../api/knowledge';

export const useCollections = () => useQuery({
  queryKey: ['knowledge', 'collections'],
  queryFn: () => knowledgeApi.getCollections().then(r => r.data)
});

export const useQueryCollection = () => useMutation({
  mutationFn: (data: { collection_id: string; query: string; n_results?: number }) =>
    knowledgeApi.query(data).then(r => r.data)
});

export const useCreateCollection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      knowledgeApi.createCollection(data).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge', 'collections'] });
    }
  });
};

export const useIngestDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ collectionId, file }: { collectionId: string; file: File }) =>
      knowledgeApi.ingestDocument(collectionId, file).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge', 'collections'] });
    }
  });
};

