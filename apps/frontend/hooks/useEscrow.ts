import { useQuery } from '@tanstack/react-query';
import { IEscrowExtended, IUseEscrowReturn } from '@/types/escrow';
import { EscrowService } from '@/services/escrow';
import { ApiError } from '@/lib/api-client';

export const useEscrow = (id: string): IUseEscrowReturn => {
  const query = useQuery<IEscrowExtended | null, ApiError>({
    queryKey: ['escrow', id],
    queryFn: () => EscrowService.getEscrowById(id),
    enabled: !!id,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 404) return false;
      return failureCount < 2;
    },
  });

  const errorMessage = query.error
    ? query.error instanceof ApiError && query.error.status === 404
      ? 'Escrow not found'
      : 'Failed to load escrow details'
    : null;

  return {
    escrow: query.data ?? null,
    loading: query.isLoading,
    error: errorMessage,
  };
};
