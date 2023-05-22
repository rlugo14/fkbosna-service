const filterNullAndUndefined = (obj: object) =>
  Object.keys(obj)
    .filter((key) => obj[key] !== null && obj[key] !== undefined)
    .reduce((previous, current) => {
      previous[current] = obj[current];
      return previous;
    }, {});

export default filterNullAndUndefined;
