"use client";

import React from "react";
import { SearchableSelect } from "./SearchableSelect";
import { useZones } from "@/hooks/useZone";
import { useZoneFactories } from "@/hooks/useFactory";
import { useFactoryClusters } from "@/hooks/useCluster";
import { useClusterFarms } from "@/hooks/useFarm";
import { useClusterWorkers } from "@/hooks/useWorkers";

export type GeoLevel = "zone" | "factory" | "cluster" | "farm" | "worker";

export interface GeoHierarchyValues {
  zoneId: string;
  factoryId: string;
  clusterId: string;
  farmId: string;
  workerId: string;
}

interface GeoHierarchyFilterProps {
  /** Which levels to show. Defaults to zone→factory→cluster */
  levels?: GeoLevel[];
  values: GeoHierarchyValues;
  onChange: (values: GeoHierarchyValues) => void;
  /** Width class for each select, e.g. "w-40" */
  selectWidth?: string;
}

const defaultLevels: GeoLevel[] = ["zone", "factory", "cluster"];

export const GeoHierarchyFilter: React.FC<GeoHierarchyFilterProps> = ({
  levels = defaultLevels,
  values,
  onChange,
  selectWidth = "w-40",
}) => {
  const showZone = levels.includes("zone");
  const showFactory = levels.includes("factory");
  const showCluster = levels.includes("cluster");
  const showFarm = levels.includes("farm");
  const showWorker = levels.includes("worker");

  const { data: zonesData } = useZones();
  const { data: factoriesData } = useZoneFactories(values.zoneId);
  const { data: clustersData } = useFactoryClusters(values.factoryId);
  const { data: farmsData } = useClusterFarms(values.clusterId);
  const { data: workersData } = useClusterWorkers(values.clusterId);

  const zones = Array.isArray(zonesData) ? zonesData : [];
  const factories = factoriesData?.data || [];
  const clusters = clustersData?.data || [];
  const farms = farmsData?.data || [];
  const workers = workersData?.data || [];

  const zoneOptions = zones.map((z) => ({ value: z.id, label: z.name }));
  const factoryOptions = factories.map((f) => ({ value: f.id, label: f.name }));
  const clusterOptions = clusters.map((c) => ({ value: c.id, label: c.name }));
  const farmOptions = farms.map((f) => ({ value: f.id, label: f.name }));
  const workerOptions = workers.map((w) => ({ value: w.id, label: w.name }));

  const handleZoneChange = (zoneId: string) => {
    onChange({ zoneId, factoryId: "", clusterId: "", farmId: "", workerId: "" });
  };

  const handleFactoryChange = (factoryId: string) => {
    onChange({ ...values, factoryId, clusterId: "", farmId: "", workerId: "" });
  };

  const handleClusterChange = (clusterId: string) => {
    onChange({ ...values, clusterId, farmId: "", workerId: "" });
  };

  const handleFarmChange = (farmId: string) => {
    onChange({ ...values, farmId });
  };

  const handleWorkerChange = (workerId: string) => {
    onChange({ ...values, workerId });
  };

  return (
    <>
      {showZone && (
        <div className={selectWidth}>
          <SearchableSelect
            label=""
            options={[{ value: "", label: "All Zones" }, ...zoneOptions]}
            value={values.zoneId}
            onChange={handleZoneChange}
            placeholder="Filter by zone"
          />
        </div>
      )}

      {showFactory && values.zoneId && (
        <div className={selectWidth}>
          <SearchableSelect
            label=""
            options={[{ value: "", label: "All Factories" }, ...factoryOptions]}
            value={values.factoryId}
            onChange={handleFactoryChange}
            placeholder="Filter by factory"
          />
        </div>
      )}

      {showCluster && values.factoryId && (
        <div className={selectWidth}>
          <SearchableSelect
            label=""
            options={[{ value: "", label: "All Clusters" }, ...clusterOptions]}
            value={values.clusterId}
            onChange={handleClusterChange}
            placeholder="Filter by cluster"
          />
        </div>
      )}

      {showFarm && values.clusterId && (
        <div className={selectWidth}>
          <SearchableSelect
            label=""
            options={[{ value: "", label: "All Farms" }, ...farmOptions]}
            value={values.farmId}
            onChange={handleFarmChange}
            placeholder="Filter by farm"
          />
        </div>
      )}

      {showWorker && values.clusterId && (
        <div className={selectWidth}>
          <SearchableSelect
            label=""
            options={[{ value: "", label: "All Workers" }, ...workerOptions]}
            value={values.workerId}
            onChange={handleWorkerChange}
            placeholder="Filter by worker"
          />
        </div>
      )}
    </>
  );
};
