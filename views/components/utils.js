const listUnion = (list1, list2, field) => {
  var result = [];

  for (var i = 0; i < list1.length; i++) {
    var item1 = list1[i],
      found = false;
    for (var j = 0; j < list2.length && !found; j++) {
      found = item1[field] === list2[j][field];
    }

    if (found) result.push(item1);
  }
  return result;
};

const jsonTryParse = (value) => {
  if (value) {
    let jsonObject = null;
    try {
      jsonObject = JSON.parse(value);
    } catch (error) {
      console.log("JSON Parse Error", error);
    }
    return jsonObject;
  }

  return null;
};
export { listUnion, jsonTryParse };
