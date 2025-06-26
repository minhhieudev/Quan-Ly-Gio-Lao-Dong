/**
 * Utility functions for handling academic years dynamically
 */

/**
 * Generate academic year options starting from 2023-2024
 * @param {number} yearsAhead - Number of years ahead to generate (default: 2)
 * @returns {Array} Array of academic year options with value and label
 */
export const generateAcademicYearOptions = (yearsAhead = 2) => {
  const startYear = 2023; // Starting from 2023-2024
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-based (0 = January, 8 = September)

  // Determine the current academic year's starting year
  let currentAcademicStartYear;
  if (currentMonth >= 8) { // September or later - new academic year has started
    currentAcademicStartYear = currentYear;
  } else { // Before September - still in previous academic year
    currentAcademicStartYear = currentYear - 1;
  }

  // Generate from startYear to current academic year + yearsAhead
  const endYear = currentAcademicStartYear + yearsAhead;
  const options = [];

  for (let year = startYear; year <= endYear; year++) {
    const nextYear = year + 1;
    const value = `${year}-${nextYear}`;
    const label = `${year} - ${nextYear}`;

    options.push({
      value,
      label
    });
  }

  return options;
};

/**
 * Get the current academic year based on Vietnamese academic calendar
 * Academic year starts in September and ends in August of the following year
 * @returns {string} Current academic year in format "YYYY-YYYY"
 */
export const getCurrentAcademicYear = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-based (0 = January, 8 = September)

  if (currentMonth >= 8) { // September or later - new academic year has started
    return `${currentYear}-${currentYear + 1}`;
  } else { // January to August - still in previous academic year
    return `${currentYear - 1}-${currentYear}`;
  }
};

/**
 * Get academic year options with current year as default
 * @param {number} yearsAhead - Number of years ahead to generate (default: 3)
 * @returns {Object} Object containing options array and defaultValue
 */
export const getAcademicYearConfig = (yearsAhead = 3) => {
  const options = generateAcademicYearOptions(yearsAhead);
  const defaultValue = getCurrentAcademicYear();
  
  return {
    options,
    defaultValue
  };
};

/**
 * Check if an academic year is valid (exists in the generated options)
 * @param {string} academicYear - Academic year to validate
 * @param {number} yearsAhead - Number of years ahead to check against
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidAcademicYear = (academicYear, yearsAhead = 3) => {
  const options = generateAcademicYearOptions(yearsAhead);
  return options.some(option => option.value === academicYear);
};

/**
 * Get the next academic year
 * @param {string} currentAcademicYear - Current academic year in format "YYYY-YYYY"
 * @returns {string} Next academic year in format "YYYY-YYYY"
 */
export const getNextAcademicYear = (currentAcademicYear) => {
  const [startYear] = currentAcademicYear.split('-');
  const nextStartYear = parseInt(startYear) + 1;
  return `${nextStartYear}-${nextStartYear + 1}`;
};

/**
 * Get the previous academic year
 * @param {string} currentAcademicYear - Current academic year in format "YYYY-YYYY"
 * @returns {string} Previous academic year in format "YYYY-YYYY"
 */
export const getPreviousAcademicYear = (currentAcademicYear) => {
  const [startYear] = currentAcademicYear.split('-');
  const prevStartYear = parseInt(startYear) - 1;
  return `${prevStartYear}-${prevStartYear + 1}`;
};
