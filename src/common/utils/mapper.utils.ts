export const mapperFilter = (filters: object): object => {
  const filter = JSON.stringify(filters).replace(
    /lt|lte|gt|gte/g,
    (match) => `$${match}`,
  );

  return JSON.parse(filter);
};
