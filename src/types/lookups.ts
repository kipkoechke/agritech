// Regions
export interface Region {
  id: string;
  name: string;
}

export interface RegionsResponse {
  data: Region[];
}

// Counties
export interface County {
  id: string;
  name: string;
  code: string;
}

export interface RegionWithCounties extends Region {
  counties: County[];
}

// Sub-Counties
export interface SubCounty {
  id: string;
  name: string;
  code: string;
}

export interface CountyWithSubCounties extends County {
  region_id: string;
  sub_counties: SubCounty[];
}
