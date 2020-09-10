// local storage data
const getLocalStorageData = () => {
  const serializedData = localStorage.getItem("localData");
  if (serializedData === null) return {};
  return JSON.parse(serializedData);
};

let localData = getLocalStorageData();

//update localStorage - data
const updateLocalStorage = (data) => {
  const serializedData = JSON.stringify(data);
  localStorage.setItem("localData", serializedData);
};

const getCellData = () => {
  Object.keys(localData).map(
    (key) =>
      (document.querySelector(`#${key}`).textContent = localData[key].formula
        ? localData[key].formula
        : localData[key].value)
  );
};

const getCellStyle = () => {
    Object.keys(localStyle).map(
      (key) =>{
          if(localStyle[key].fontWeight){
            document.querySelector(`#${key}`).style.fontWeight = localStyle[key].fontWeight;
          }
          else if(localStyle[key].fontStyle){
            document.querySelector(`#${key}`).style.fontStyle = localStyle[key].fontStyle;
          }
          else if(localStyle[key].textDecoration){
            document.querySelector(`#${key}`).style.textDecoration = localStyle[key].textDecoration
          }
         
      });
  };


//Styling

const getLocalStorageStyle = () => {
  const serializedData = localStorage.getItem("localStyle");
  if (serializedData === null) return {};
  return JSON.parse(serializedData);
};
let selectedCell = "";
let localStyle = getLocalStorageStyle();

const updateLocalStorageStyle = (style) => {
    const serializedData = JSON.stringify(style);
    localStorage.setItem("localStyle", serializedData);
  };

document.querySelector("#bold").addEventListener("click", () => {
  selectedCell.style.fontWeight = 600;
  localStyle[selectedCell.id] = {};
  localStyle[selectedCell.id]["fontWeight"] = 600;
  updateLocalStorageStyle(localStyle);
});
document.querySelector("#italic").addEventListener("click", () => {
  selectedCell.style.fontStyle = "italic";
  localStyle[selectedCell.id] = {};
  localStyle[selectedCell.id]["fontStyle"] = "italic";
  updateLocalStorageStyle(localStyle);
});
document.querySelector("#underline").addEventListener("click", () => {
  selectedCell.style.textDecoration = "underline";
  localStyle[selectedCell.id] = {};
  localStyle[selectedCell.id]["textDecoration"] = "underline";
  updateLocalStorageStyle(localStyle);
});

//on click of Refresh
document.querySelector("#btnRefresh").addEventListener("click", () => {
    let table = document.querySelector("#table");
    table.removeChild(table.firstChild);
    localData = getLocalStorageData();
    localStyle = getLocalStorageStyle();
    drawTable();
    onCellInput();
    getCellData();
    getCellStyle();
  });

//convert the alphaNumeric to Numeric
const getNumericValue = (formula, regAlphaNumeric) =>
  formula.replace(regAlphaNumeric, (key) =>
    "formula" in localData[key] ? localData[key].formula : localData[key].value
  );

// Basic functions
const addFormula = (key, value) => {
  const regExp = /[a-zA-Z]+\(+[0-9]*\.*[0-9]+\:+([0-9]*\.*[0-9]*\:*[0-9])*\)/g;
  const regExpSum = /sum\(+[0-9]*\.*[0-9]+\:+([0-9]*\.*[0-9]*\:*[0-9])*\)/gi;
  const regExpBrackets = /\(([^)]+)\)/;
  const regAlphaNumeric = /[A-Z]\w*[0-9]/g;

  let result = "";
  const formula = value.substr(1).toUpperCase();
  let numericValue = getNumericValue(formula, regAlphaNumeric);
  if (numericValue.match(regExp)) {
    if (numericValue.match(regExpSum)) {
      const reducer = (acc, current) => parseInt(acc) + parseInt(current);
      let matchingExp = formula.match(regExpBrackets)[1].split(":");
      let col = matchingExp.map((e) => e.replace(/[^a-z]/gi, ""))[1];
      let rowStart = matchingExp.map((e) => e.replace(/[a-z]/gi, ""))[0];
      let rowend = matchingExp.map((e) => e.replace(/[a-z]/gi, ""))[1];

      numericValue = Array.from(
        { length: rowend },
        (v, rowStart) => rowStart + 1                 // creates an array with eg: 5 indexes and value undefined
      )
        .map((row) => `${col}` + row)
        .map((el) => localData[el].value)
        .reduce(reducer);
    }
  }
  result = eval(numericValue);

  if (result) {
    localData[key]["formula"] = result;
    return result;
  }
};

// convert numbers to alphabets
const convertNumToAlpha = (number) => {
  let baseChar = "A".charCodeAt(0);
  let letters = "";
  do {
    number -= 1;
    letters = String.fromCharCode(baseChar + (number % 26)) + letters;
    number = Math.floor(number / 26);
  } while (number > 0);

  return letters;
};

//draw 100X100 cells
const drawTable = () => {
  for (let i = 0; i < 101; i++) {
    let row = document.querySelector("#table").insertRow(-1); // adds a row row to the end
    for (let j = 0; j < 101; j++) {
      let columnLetter = convertNumToAlpha(j);
      let cell = row.insertCell(); // adds a cell
      cell.setAttribute("contenteditable", true);
      if (i && j) {
        cell.id = columnLetter + i;
      } else if (i !== 0 || j !== 0) {
        cell.outerHTML = `<th>${i || columnLetter}</th>`;
      } else {
        cell.outerHTML = `<th></th>`;
      }
    }
  }
};

//on cell input
onCellInput = () => {
  let INPUTS = [...document.querySelectorAll("#table td")];  // to convert node list to array
  INPUTS.map((ele) =>
    ele.addEventListener("focus", () => {
      if (ele.textContent) {
        selectedCell = ele;
        ele.textContent = localData[ele.id]["value"];
      }
    })
  );

  INPUTS.map((ele) =>
    ele.addEventListener("blur", () => {
      if (ele.textContent) {
        selectedCell = ele;
        localData[ele.id] = {};
        localData[ele.id]["value"] = ele.textContent;
        if (ele.textContent.startsWith("=")) {
          ele.textContent = addFormula(ele.id, ele.textContent);
        }
        updateLocalStorage(localData);
      } else {
        updateLocalStorage(localData);
      }
    })
  );
};

document.addEventListener("DOMContentLoaded", function () {
  localStorage.clear();
  localData = {};
  drawTable();
  onCellInput();
});
