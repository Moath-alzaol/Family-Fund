import { useQuery } from '@tanstack/react-query';

import { fetchFundBalance, fetchPersonalBalances } from '@/api/queries';

export function usePersonalBalances() {
  return useQuery({ queryKey: ['personal-balances'], queryFn: fetchPersonalBalances });
}

export function useFundBalance() {
  return useQuery({ queryKey: ['fund-balance'], queryFn: fetchFundBalance });
}
