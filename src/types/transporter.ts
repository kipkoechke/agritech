import { Pagination } from "./pagination";

export interface TransporterContacts {
  phone?: string;
  email?: string;
  primary_phone?: string;
  secondary_phone?: string;
  emergency_phone?: string;
  contact_person?: string;
  designation?: string;
}

export interface TransporterMetadata {
  driver_name?: string;
  route?: string;
  license_number?: string;
  kra_pin?: string;
  establishment_year?: number;
  fleet_size?: number;
  vehicle_types?: {
    refrigerated_trucks?: number;
    insulated_vans?: number;
    milk_tankers?: number;
  };
  capacity?: {
    total_volume?: string;
    routes_per_day?: number;
    service_radius?: string;
  };
  services?: string[];
  certifications?: string[];
  operating_hours?: {
    collection?: string;
    distribution?: string;
    emergency?: string;
  };
}

export interface TransporterRegion {
  id: string;
  name: string;
}

export interface TransporterUser {
  id: string;
  name: string;
}

export interface Transporter {
  id: string;
  name: string;
  license_plate: string | null;
  capacity: string | null;
  contacts: TransporterContacts | null;
  metadata: TransporterMetadata | null;
  created_at: string;
  updated_at: string;
  region: TransporterRegion | null;
  user: TransporterUser | null;
  wallet_balance?: string;
}

export interface TransportersResponse {
  data: Transporter[];
  pagination: Pagination;
}

export interface CreateTransporterPayload {
  name: string;
  license_plate?: string;
  capacity?: number;
  contacts?: {
    phone?: string;
    email?: string;
  };
  metadata?: {
    driver_name?: string;
    route?: string;
  };
  region_id?: string;
}

export interface UpdateTransporterPayload {
  name?: string;
  license_plate?: string;
  capacity?: number;
  contacts?: {
    phone?: string;
    email?: string;
  };
  metadata?: {
    driver_name?: string;
    route?: string;
  };
  region_id?: string;
}
