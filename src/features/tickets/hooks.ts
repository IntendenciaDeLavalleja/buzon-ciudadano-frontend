import { useMutation } from '@tanstack/react-query';
import api from '../../lib/axios';
import type { TicketFormData } from './schema';

export interface TicketCreateResponse {
  message: string;
  tracking_code: string;
  status: string;
  created_at: string;
}

export function useCreateTicket() {
  return useMutation<TicketCreateResponse, Error, TicketFormData>({
    mutationFn: async (data: TicketFormData) => {
      const formData = new FormData();
      formData.append('municipality_or_destination', data.municipality_or_destination);
      formData.append('category', data.category);
      formData.append('full_name', data.full_name);
      formData.append('email', data.email);
      formData.append('description', data.description);
      formData.append('location_lat', String(data.location.lat));
      formData.append('location_lng', String(data.location.lng));
      if (data.file && data.file.length > 0) {
        formData.append('file', data.file[0]);
      }
      const response = await api.post<TicketCreateResponse>('/api/tickets', formData);
      return response.data;
    },
  });
}
