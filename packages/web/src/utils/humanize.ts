export const humanize = (value: string) => {
    const camelMatch = /([A-Z])/g;
    const underscoreMatch = /_/g;
  
    const camelCaseToSpaces = value.replace(camelMatch, " $1");
    const underscoresToSpaces = camelCaseToSpaces.replace(underscoreMatch, " ");
    const caseCorrected =
      underscoresToSpaces.charAt(0).toUpperCase() +
      underscoresToSpaces.slice(1).toLowerCase();
  
    return caseCorrected;
  };