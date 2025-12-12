interface AddressType {
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  formatted_address: string;
}
interface LocationType {
  lat: number;
  lng: number;
}
export interface Depot {
  name: string;
  address: AddressType;
  id: number;
  tenant_id: number;
  location: LocationType;
}
