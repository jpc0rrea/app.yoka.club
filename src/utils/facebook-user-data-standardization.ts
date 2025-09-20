/**
 * Facebook User Data Standardization Library
 *
 * This library provides functions to standardize user data according to Facebook's
 * Conversion API requirements before hashing. Each function transforms input data
 * into the standardized format required by Facebook.
 *
 * Reference: Facebook Conversion API User Data Parameters
 * https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/customer-information-parameters
 */

/**
 * Standardizes email addresses for Facebook Conversion API
 * Requirements: Remove whitespace, convert to lowercase
 *
 * @param email - Raw email input
 * @returns Standardized email string
 *
 * @example
 * Input: "John_Smith@gmail.com"
 * Output: "john_smith@gmail.com"
 */
export function standardizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return '';
  }

  return email.trim().toLowerCase();
}

/**
 * Standardizes phone numbers for Facebook Conversion API
 * Requirements: Remove symbols, letters, leading zeros. Include country code.
 *
 * @param phone - Raw phone number input
 * @param defaultCountryCode - Default country code if not present (e.g., "55" for Brazil)
 * @returns Standardized phone number string
 *
 * @example
 * Input: "(650)555-1212"
 * Output: "16505551212" (US number)
 *
 * @example
 * Input: "(11) 99999-9999"
 * Output: "5511999999999" (Brazil number with country code 55)
 */
export function standardizePhone(
  phone: string,
  defaultCountryCode: string = '55'
): string {
  if (!phone || typeof phone !== 'string') {
    return '';
  }

  // Remove all non-digit characters
  let cleanPhone = phone.replace(/\D/g, '');

  // Remove leading zeros
  cleanPhone = cleanPhone.replace(/^0+/, '');

  // If phone doesn't start with country code, add default
  if (defaultCountryCode && !cleanPhone.startsWith(defaultCountryCode)) {
    // Check if it's already a valid international number (longer than typical local number)
    if (cleanPhone.length <= 11) {
      // Typical max local number length
      cleanPhone = defaultCountryCode + cleanPhone;
    }
  }

  return cleanPhone;
}

/**
 * Standardizes first name for Facebook Conversion API
 * Requirements: Lowercase, no punctuation, UTF-8 encoded
 *
 * @param firstName - Raw first name input
 * @returns Standardized first name string
 *
 * @example
 * Input: "Mary"
 * Output: "mary"
 *
 * @example
 * Input: "Valéry"
 * Output: "valéry"
 */
export function standardizeFirstName(firstName: string): string {
  if (!firstName || typeof firstName !== 'string') {
    return '';
  }

  return firstName
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{M}]/gu, ''); // Remove punctuation but keep Unicode letters and marks
}

/**
 * Standardizes last name for Facebook Conversion API
 * Requirements: Lowercase, no punctuation, UTF-8 encoded
 *
 * @param lastName - Raw last name input
 * @returns Standardized last name string
 *
 * @example
 * Input: "Smith"
 * Output: "smith"
 */
export function standardizeLastName(lastName: string): string {
  if (!lastName || typeof lastName !== 'string') {
    return '';
  }

  return lastName
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{M}]/gu, ''); // Remove punctuation but keep Unicode letters and marks
}

/**
 * Standardizes city name for Facebook Conversion API
 * Requirements: Lowercase, no punctuation, special characters, or spaces
 *
 * @param city - Raw city name input
 * @returns Standardized city string
 *
 * @example
 * Input: "New York"
 * Output: "newyork"
 *
 * @example
 * Input: "São Paulo"
 * Output: "saopaulo"
 */
export function standardizeCity(city: string): string {
  if (!city || typeof city !== 'string') {
    return '';
  }

  return city
    .trim()
    .toLowerCase()
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
    .replace(/[^\p{L}\p{N}]/gu, ''); // Remove everything except letters and numbers
}

/**
 * Standardizes state for Facebook Conversion API
 * Requirements: Two-character ANSI abbreviation code in lowercase for US states,
 * lowercase for non-US states, no punctuation or spaces
 *
 * @param state - Raw state input
 * @param country - Country code to determine formatting rules
 * @returns Standardized state string
 *
 * @example
 * Input: "California"
 * Output: "ca"
 *
 * @example
 * Input: "Arizona"
 * Output: "az"
 */
export function standardizeState(
  state: string,
  country: string = 'br'
): string {
  if (!state || typeof state !== 'string') {
    return '';
  }

  const cleanState = state
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, ''); // Remove everything except lowercase letters

  // For US states, try to convert to two-letter code
  if (country.toLowerCase() === 'us') {
    const usStateMap: Record<string, string> = {
      alabama: 'al',
      alaska: 'ak',
      arizona: 'az',
      arkansas: 'ar',
      california: 'ca',
      colorado: 'co',
      connecticut: 'ct',
      delaware: 'de',
      florida: 'fl',
      georgia: 'ga',
      hawaii: 'hi',
      idaho: 'id',
      illinois: 'il',
      indiana: 'in',
      iowa: 'ia',
      kansas: 'ks',
      kentucky: 'ky',
      louisiana: 'la',
      maine: 'me',
      maryland: 'md',
      massachusetts: 'ma',
      michigan: 'mi',
      minnesota: 'mn',
      mississippi: 'ms',
      missouri: 'mo',
      montana: 'mt',
      nebraska: 'ne',
      nevada: 'nv',
      newhampshire: 'nh',
      newjersey: 'nj',
      newmexico: 'nm',
      newyork: 'ny',
      northcarolina: 'nc',
      northdakota: 'nd',
      ohio: 'oh',
      oklahoma: 'ok',
      oregon: 'or',
      pennsylvania: 'pa',
      rhodeisland: 'ri',
      southcarolina: 'sc',
      southdakota: 'sd',
      tennessee: 'tn',
      texas: 'tx',
      utah: 'ut',
      vermont: 'vt',
      virginia: 'va',
      washington: 'wa',
      westvirginia: 'wv',
      wisconsin: 'wi',
      wyoming: 'wy',
    };

    return usStateMap[cleanState] || cleanState.substring(0, 2);
  }

  // For Brazilian states, convert to two-letter code
  if (country.toLowerCase() === 'br') {
    const brStateMap: Record<string, string> = {
      acre: 'ac',
      alagoas: 'al',
      amapa: 'ap',
      amazonas: 'am',
      bahia: 'ba',
      ceara: 'ce',
      distritofederal: 'df',
      espiritosanto: 'es',
      goias: 'go',
      maranhao: 'ma',
      matogrosso: 'mt',
      matogrossodosul: 'ms',
      minasgerais: 'mg',
      para: 'pa',
      paraiba: 'pb',
      parana: 'pr',
      pernambuco: 'pe',
      piaui: 'pi',
      riodejaneiro: 'rj',
      riograndedonorte: 'rn',
      riograndedosul: 'rs',
      rondonia: 'ro',
      roraima: 'rr',
      santacatarina: 'sc',
      saopaulo: 'sp',
      sergipe: 'se',
      tocantins: 'to',
    };

    return brStateMap[cleanState] || cleanState.substring(0, 2);
  }

  return cleanState;
}

/**
 * Standardizes ZIP/postal code for Facebook Conversion API
 * Requirements: Lowercase, no spaces or dashes. For US: first 5 digits only.
 * For UK: area, district, and sector format.
 *
 * @param zipCode - Raw ZIP/postal code input
 * @param country - Country code to determine formatting rules
 * @returns Standardized ZIP code string
 *
 * @example
 * Input: "94035-1234" (US)
 * Output: "94035"
 *
 * @example
 * Input: "M1 1AE" (UK)
 * Output: "m11ae"
 */
export function standardizeZipCode(
  zipCode: string,
  country: string = 'br'
): string {
  if (!zipCode || typeof zipCode !== 'string') {
    return '';
  }

  let cleanZip = zipCode
    .trim()
    .toLowerCase()
    // eslint-disable-next-line no-useless-escape
    .replace(/[\s\-]/g, ''); // Remove spaces and dashes

  // For US ZIP codes, use only first 5 digits
  if (country.toLowerCase() === 'us') {
    const match = cleanZip.match(/^\d{5}/);
    return match ? match[0] : cleanZip.substring(0, 5);
  }

  // For Brazilian CEP, remove non-digits and format
  if (country.toLowerCase() === 'br') {
    cleanZip = cleanZip.replace(/\D/g, '');
    return cleanZip.substring(0, 8); // CEP has 8 digits
  }

  // For UK postcodes, keep letters and numbers only
  if (country.toLowerCase() === 'uk' || country.toLowerCase() === 'gb') {
    return cleanZip.replace(/[^a-z0-9]/g, '');
  }

  // For other countries, remove special characters
  return cleanZip.replace(/[^a-z0-9]/g, '');
}

/**
 * Standardizes country code for Facebook Conversion API
 * Requirements: Two-letter lowercase ISO 3166-1 alpha-2 country code
 *
 * @param country - Raw country input (name or code)
 * @returns Standardized country code string
 *
 * @example
 * Input: "Estados Unidos"
 * Output: "us"
 *
 * @example
 * Input: "Brazil"
 * Output: "br"
 */
export function standardizeCountry(country: string): string {
  if (!country || typeof country !== 'string') {
    return '';
  }

  const cleanCountry = country.trim().toLowerCase();

  // If already a 2-letter code, return it
  if (cleanCountry.length === 2 && /^[a-z]{2}$/.test(cleanCountry)) {
    return cleanCountry;
  }

  // Common country name mappings
  const countryMap: Record<string, string> = {
    // English names
    'united states': 'us',
    usa: 'us',
    america: 'us',
    brazil: 'br',
    brasil: 'br',
    'united kingdom': 'gb',
    uk: 'gb',
    england: 'gb',
    britain: 'gb',
    canada: 'ca',
    australia: 'au',
    germany: 'de',
    deutschland: 'de',
    france: 'fr',
    italy: 'it',
    italia: 'it',
    spain: 'es',
    españa: 'es',
    portugal: 'pt',
    mexico: 'mx',
    méxico: 'mx',
    argentina: 'ar',
    chile: 'cl',
    colombia: 'co',
    peru: 'pe',
    perú: 'pe',
    venezuela: 've',
    ecuador: 'ec',
    uruguay: 'uy',
    paraguay: 'py',
    bolivia: 'bo',
    japan: 'jp',
    japão: 'jp',
    china: 'cn',
    india: 'in',
    índia: 'in',
    russia: 'ru',
    rússia: 'ru',

    // Portuguese names (unique keys)
    'estados unidos pt': 'us',
    eua: 'us',
    'reino unido pt': 'gb',
    inglaterra: 'gb',
    'canadá pt': 'ca',
    austrália: 'au',
    alemanha: 'de',
    frança: 'fr',
    itália: 'it',
    'espanha pt': 'es',
    'coreia do sul': 'kr',
    'coreia do norte': 'kp',

    // Spanish names (unique keys)
    'estados unidos es': 'us',
    eeuu: 'us',
    'reino unido es': 'gb',
    'canadá es': 'ca',
    'australia es': 'au',
    alemania: 'de',
    francia: 'fr',
    'italia es': 'it',
    japón: 'jp',
  };

  return countryMap[cleanCountry] || cleanCountry.substring(0, 2);
}

/**
 * Standardizes all user data at once
 *
 * @param userData - Raw user data object
 * @returns Standardized user data object
 */
export function standardizeUserData(
  userData: {
    email?: string;
    phone?: string;
    first_name?: string;
    last_name?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    country?: string;
  },
  defaultCountryCode: string = '55'
): {
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
} {
  const standardized: Record<string, string> = {};

  if (userData.email) {
    standardized.email = standardizeEmail(userData.email);
  }

  if (userData.phone) {
    standardized.phone = standardizePhone(userData.phone, defaultCountryCode);
  }

  if (userData.first_name) {
    standardized.first_name = standardizeFirstName(userData.first_name);
  }

  if (userData.last_name) {
    standardized.last_name = standardizeLastName(userData.last_name);
  }

  if (userData.city) {
    standardized.city = standardizeCity(userData.city);
  }

  if (userData.country) {
    standardized.country = standardizeCountry(userData.country);
  }

  if (userData.state) {
    standardized.state = standardizeState(userData.state, standardized.country);
  }

  if (userData.zip_code) {
    standardized.zip_code = standardizeZipCode(
      userData.zip_code,
      standardized.country
    );
  }

  return standardized;
}
