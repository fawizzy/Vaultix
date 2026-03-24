import { apiClient } from '@/lib/api-client';
import {
  IEscrow,
  IEscrowExtended,
  IEscrowResponse,
  IEscrowFilters,
  IEscrowEventResponse,
  IEscrowEventFilters,
} from '@/types/escrow';

export class EscrowService {
  static async getEscrows(filters: IEscrowFilters = {}): Promise<IEscrowResponse> {
    return apiClient.get<IEscrowResponse>('/escrows', {
      status: filters.status !== 'all' ? filters.status : undefined,
      search: filters.search,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      page: filters.page,
      limit: filters.limit,
    });
  }

  static async getEscrowById(id: string): Promise<IEscrowExtended | null> {
    return apiClient.get<IEscrowExtended>(`/escrows/${id}`);
  }

  static async getEvents(filters: IEscrowEventFilters = {}): Promise<IEscrowEventResponse> {
    if (filters.escrowId) {
      return apiClient.get<IEscrowEventResponse>(`/escrows/${filters.escrowId}/events`, {
        eventType: filters.eventType,
        page: filters.page,
        limit: filters.limit,
      });
    }
    return apiClient.get<IEscrowEventResponse>('/events', {
      eventType: filters.eventType,
      page: filters.page,
      limit: filters.limit,
    });
  }

  static async createEscrow(data: Partial<IEscrow>): Promise<IEscrow> {
    return apiClient.post<IEscrow>('/escrows', data);
  }

  static async fund(id: string, dto?: Record<string, unknown>): Promise<IEscrow> {
    return apiClient.post<IEscrow>(`/escrows/${id}/fund`, dto ?? {});
  }

  static async release(id: string): Promise<IEscrow> {
    return apiClient.post<IEscrow>(`/escrows/${id}/release`);
  }

  static async cancel(id: string, reason?: string): Promise<IEscrow> {
    return apiClient.post<IEscrow>(`/escrows/${id}/cancel`, reason ? { reason } : {});
  }

  static async fileDispute(id: string, reason: string): Promise<IEscrow> {
    return apiClient.post<IEscrow>(`/escrows/${id}/dispute`, { reason });
  }

  static async fulfillCondition(
    escrowId: string,
    conditionId: string,
    data?: Record<string, unknown>,
  ): Promise<IEscrow> {
    return apiClient.post<IEscrow>(
      `/escrows/${escrowId}/conditions/${conditionId}/fulfill`,
      data ?? {},
    );
  }

  static async confirmCondition(escrowId: string, conditionId: string): Promise<IEscrow> {
    return apiClient.post<IEscrow>(`/escrows/${escrowId}/conditions/${conditionId}/confirm`);
  }

  static async updateEscrowStatus(id: string, status: IEscrow['status']): Promise<IEscrow> {
    return apiClient.patch<IEscrow>(`/escrows/${id}`, { status });
  }
}
