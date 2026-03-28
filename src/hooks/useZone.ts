import { useQuery } from "@tanstack/react-query";
import { getZones } from "@/services/zoneService";

export const useZones = () => {
  return useQuery({
    queryKey: ["zones"],
    queryFn: getZones,
  });
};
