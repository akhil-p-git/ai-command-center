import { useQuery } from '@tanstack/react-query';
import { conversationsApi, ConversationFilters } from '../api/conversations';

export const useConversations = (filters: ConversationFilters) => useQuery({
  queryKey: ['conversations', filters],
  queryFn: () => conversationsApi.getList(filters).then(r => r.data)
});

export const useConversation = (id: string) => useQuery({
  queryKey: ['conversations', id],
  queryFn: () => conversationsApi.getById(id).then(r => r.data),
  enabled: !!id
});

