// const { parseDynamic } = require("./helpers/utils");

// const DELIMITER = "__";
// const filter = { category: "shoes", gender: "women", price__gt: 5, abc__lt: 7 };
// const filterCondition = [{ spreadsheetId: "abc" }];

// if (filter) {
//   const withDelimiter = Object.keys(filter)
//     .filter((key) => key.indexOf(DELIMITER) > -1)
//     .map((key) => {
//       const segment = key.split(DELIMITER);
//       const operator = segment[segment.length - 1];
//       segment.pop();
//       const field = segment.join(DELIMITER);
//       return [field, operator, key];
//     });
//   const noDelimiter = Object.keys(filter).filter(
//     (key) => key.indexOf(DELIMITER) === -1
//   );

//   if (noDelimiter) {
//     noDelimiter.forEach((item) => {
//       filterCondition.push({
//         [item]: parseDynamic(filter[item]),
//       });
//     });
//   }
//   if (withDelimiter) {
//     withDelimiter.forEach(([item1, item2, item3]) => {
//       filterCondition.push({
//         [item1]: {
//           [`$${item2}`]: parseDynamic(filter[item3]),
//         },
//       });
//     });
//   }
// }

// const filterCriteria = filterCondition.length ? { $and: filterCondition } : {};
// console.log(filterCondition, filterCriteria);

const func = async () => {
  let data = [
    ["a", "b", "c"],
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ];
  let header = data[0];
  data = data.slice(1);
  const promises = data.map(async (e, index) => {
    const obj = {};
    for (let i = 0; i < e.length; i++) {
      obj[header[i]] = e[i];
    }
    console.log(obj);
    data[index] = obj;
  });
  await Promise.all(promises);
  console.log("data", data);
};

func();
