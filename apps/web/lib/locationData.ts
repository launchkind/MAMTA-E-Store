// Location data using country-state-city package
import { Country, State, City } from "country-state-city";

export interface CountryOption {
  name: string;
  isoCode: string;
  flag: string;
  phonecode: string;
  currency: string;
  latitude: string;
  longitude: string;
}

export interface StateOption {
  name: string;
  isoCode: string;
  countryCode: string;
  latitude: string | null;
  longitude: string | null;
}

export interface CityOption {
  name: string;
  countryCode: string;
  stateCode: string;
  latitude: string | null;
  longitude: string | null;
}

// Get all countries
export const getAllCountries = (): CountryOption[] => {
  return Country.getAllCountries().map((country) => ({
    name: country.name,
    isoCode: country.isoCode,
    flag: country.flag,
    phonecode: country.phonecode,
    currency: country.currency,
    latitude: country.latitude,
    longitude: country.longitude,
  }));
};

// Get states by country code
export const getStatesByCountry = (countryCode: string): StateOption[] => {
  return State.getStatesOfCountry(countryCode).map((state) => ({
    name: state.name,
    isoCode: state.isoCode,
    countryCode: state.countryCode,
    latitude: state.latitude ?? null,
    longitude: state.longitude ?? null,
  }));
};

// Get cities by country code and state code
export const getCitiesByCountryAndState = (
  countryCode: string,
  stateCode: string
): CityOption[] => {
  return City.getCitiesOfState(countryCode, stateCode).map((city) => ({
    name: city.name,
    countryCode: city.countryCode,
    stateCode: city.stateCode,
    latitude: city.latitude ?? null,
    longitude: city.longitude ?? null,
  }));
};

// Get cities by country code only (all cities in the country)
export const getCitiesByCountry = (countryCode: string): CityOption[] => {
  const cities = City.getCitiesOfCountry(countryCode);
  if (!cities) return [];

  return cities.map((city) => ({
    name: city.name,
    countryCode: city.countryCode,
    stateCode: city.stateCode,
    latitude: city.latitude ?? null,
    longitude: city.longitude ?? null,
  }));
};

// Get country by ISO code
export const getCountryByCode = (
  isoCode: string
): CountryOption | undefined => {
  const country = Country.getCountryByCode(isoCode);
  if (!country) return undefined;

  return {
    name: country.name,
    isoCode: country.isoCode,
    flag: country.flag,
    phonecode: country.phonecode,
    currency: country.currency,
    latitude: country.latitude,
    longitude: country.longitude,
  };
};

// Get state by country code and state code
export const getStateByCode = (
  countryCode: string,
  stateCode: string
): StateOption | undefined => {
  const state = State.getStateByCodeAndCountry(stateCode, countryCode);
  if (!state) return undefined;

  return {
    name: state.name,
    isoCode: state.isoCode,
    countryCode: state.countryCode,
    latitude: state.latitude ?? null,
    longitude: state.longitude ?? null,
  };
};

// Search countries by name
export const searchCountries = (query: string): CountryOption[] => {
  const lowerQuery = query.toLowerCase();
  return getAllCountries().filter((country) =>
    country.name.toLowerCase().includes(lowerQuery)
  );
};

// Search states by name in a specific country
export const searchStates = (
  countryCode: string,
  query: string
): StateOption[] => {
  const lowerQuery = query.toLowerCase();
  return getStatesByCountry(countryCode).filter((state) =>
    state.name.toLowerCase().includes(lowerQuery)
  );
};

// Search cities by name in a specific country and state
export const searchCities = (
  countryCode: string,
  stateCode: string,
  query: string
): CityOption[] => {
  const lowerQuery = query.toLowerCase();
  return getCitiesByCountryAndState(countryCode, stateCode).filter((city) =>
    city.name.toLowerCase().includes(lowerQuery)
  );
};

// Popular countries (top 20 by usage)
export const getPopularCountries = (): CountryOption[] => {
  const popularIsoCodes = [
    "US", // United States
    "GB", // United Kingdom
    "CA", // Canada
    "AU", // Australia
    "DE", // Germany
    "FR", // France
    "IN", // India
    "BD", // Bangladesh
    "JP", // Japan
    "CN", // China
    "BR", // Brazil
    "MX", // Mexico
    "ES", // Spain
    "IT", // Italy
    "NL", // Netherlands
    "SG", // Singapore
    "AE", // United Arab Emirates
    "SA", // Saudi Arabia
    "PK", // Pakistan
    "NG", // Nigeria
  ];

  return popularIsoCodes
    .map((code) => getCountryByCode(code))
    .filter((country): country is CountryOption => country !== undefined);
};
