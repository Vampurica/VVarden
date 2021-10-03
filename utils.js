// UTIL FUNCTIONS
// Must be raw tool functions requiring no outside references

let util = {
  selectRandom: function (arr) {
    // Selects a random element from an array
    let elem = arr[Math.floor(Math.random() * arr.length)];
    //logMaster("selectRandom: "+elem+"");
    return elem;
  },

  stripID: function (mention) {
    // Takes a mention and strips the mentioned ID out of it
    let takeFirst = mention.slice(2);
    let cleanID = takeFirst.slice(0, takeFirst.length - 1);
    let mblCheck = cleanID.slice(0, 1);
    if (mblCheck == "!") {
      let cleanerID = cleanID.slice(1);
      //logMaster("stripID: "+cleanerID+"");
      return cleanerID;
    } else {
      //logMaster("stripID: "+cleanID+"");
      return cleanID;
    }
  },

  stripChan: function (mention) {
    // Takes a mention and strips the mentioned chanID out of it
    let takeFirst = mention.slice(2);
    let cleanID = takeFirst.slice(0, takeFirst.length - 1);

    return cleanID;
  },

  arrIndex: function (needle, stack, callback) {
    // Gets the index of an element in an array
    //logMaster("arrIndex: "+needle+"");
    let count = stack.length;
    for (let i = 0; i < count; i++) {
      if (stack[i] === needle) {
        return callback(i);
      }
    }
    return false;
  },
};

module.exports = util;
