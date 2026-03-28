import { useQuery } from "@tanstack/react-query";
import {
  getLevels,
  getRoles,
  getGeographicRegions,
  getCountiesByRegion,
  getSubCountiesByCounty,
  getDivisionsBySubCounty,
  getLocationsByDivision,
  getSubLocationsByLocation,
} from "../services/geographicService";

// Hook to fetch levels
export const useLevels = () => {
  return useQuery({
    queryKey: ["levels"],
    queryFn: getLevels,
  });
};

// Hook to fetch roles
export const useRoles = () => {
  return useQuery({
    queryKey: ["roles"],
    queryFn: getRoles,
    select: (data) => data.data,
  });
};

// Hook to fetch regions
export const useGeographicRegions = () => {
  return useQuery({
    queryKey: ["geographic", "regions"],
    queryFn: getGeographicRegions,
    select: (data) => data.data,
  });
};

// Hook to fetch counties by region
export const useCountiesByRegion = (regionId: string | undefined) => {
  return useQuery({
    queryKey: ["geographic", "counties", regionId],
    queryFn: () => getCountiesByRegion(regionId!),
    enabled: !!regionId,
    select: (data) => data.data,
  });
};

// Hook to fetch sub-counties by county
export const useSubCountiesByCounty = (countyId: string | undefined) => {
  return useQuery({
    queryKey: ["geographic", "subcounties", countyId],
    queryFn: () => getSubCountiesByCounty(countyId!),
    enabled: !!countyId,
    select: (data) => data.data,
  });
};

// Hook to fetch divisions by sub-county
export const useDivisionsBySubCounty = (subCountyId: string | undefined) => {
  return useQuery({
    queryKey: ["geographic", "divisions", subCountyId],
    queryFn: () => getDivisionsBySubCounty(subCountyId!),
    enabled: !!subCountyId,
    select: (data) => data.data,
  });
};

// Hook to fetch locations by division
export const useLocationsByDivision = (divisionId: string | undefined) => {
  return useQuery({
    queryKey: ["geographic", "locations", divisionId],
    queryFn: () => getLocationsByDivision(divisionId!),
    enabled: !!divisionId,
    select: (data) => data.data,
  });
};

// Hook to fetch sub-locations by location
export const useSubLocationsByLocation = (locationId: string | undefined) => {
  return useQuery({
    queryKey: ["geographic", "sublocations", locationId],
    queryFn: () => getSubLocationsByLocation(locationId!),
    enabled: !!locationId,
    select: (data) => data.data,
  });
};
