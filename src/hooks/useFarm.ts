import { useQuery } from "@tanstack/react-query";
import farmService from "@/services/farmService";

export const farmKeys = {
  all: ["farms"] as const,
};

export const useFarms = () => {
  return useQuery({
    queryKey: farmKeys.all,
    queryFn: farmService.getAll,
  });
};
