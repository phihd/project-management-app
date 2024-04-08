const lodash = require('lodash')


const listEqual = (list1, list2) => {
  const sortedUniqueList1 = lodash.sortBy(lodash.uniq(list1));
  const sortedUniqueList2 = lodash.sortBy(lodash.uniq(list2));
  
  return lodash.isEqual(sortedUniqueList1, sortedUniqueList2);
}

const areDatesSameDay = (date1, date2) => {
  const normalizedDate1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const normalizedDate2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  
  return normalizedDate1.getTime() === normalizedDate2.getTime();
}


module.exports = {
  listEqual,
  areDatesSameDay
}