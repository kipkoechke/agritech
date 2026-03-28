import { useQuery } from "@tanstack/react-query";
import type { Person } from "@/types/persons";
import apiClient from "@/lib/axios";

const searchPersons = async (search: string): Promise<Person[]> => {
  if (!search || search.length < 2) return [];
  const response = await apiClient.get("/persons", { 
    params: { search, per_page: 10 } 
  });
  return response.data.data || [];
};

export const useSearchPersons = (search: string) => {
  return useQuery({
    queryKey: ["persons-search", search],
    queryFn: () => searchPersons(search),
    enabled: search.length >= 2,
  });
};
