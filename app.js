// local storage initialization
const initLocalStorage = () => {
  const serializedData = localStorage.getItem("localData");
  if (serializedData === null) return {};
  return JSON.parse(serializedData);
};

let localData = initLocalStorage();

//update localStorage
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

//on click of Refresh
document.querySelector("#btnRefresh").addEventListener("click", () => {
  let table = document.querySelector("#table");
  table.removeChild(table.firstChild);
  localData = initLocalStorage();
  drawTable();
  onCellInput();
  getCellData();
});
// convert the alphaNumeric to Numeric
const getNumericValue = (formula, regAlpha) =>
  formula.replace(regAlpha, (key) =>
    "formula" in localData[key] ? sheba[key].localData : localData[key].value
  );

// Basic functions
const addFormula = (key, value) => {
  const regAlpha = /[A-Z]\w*[0-9]/g;

  let result = "";
  const formula = value.substr(1).toUpperCase();
  const numericValue = getNumericValue(formula, regAlpha);
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
    let row = document.querySelector("#table").insertRow(-1);
    for (let j = 0; j < 101; j++) {
      let columnLetter = convertNumToAlpha(j);
      let cell = row.insertCell();
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
  let INPUTS = [...document.querySelectorAll("#table td")];
  INPUTS.map((ele) =>
    ele.addEventListener("focus", () => {
      if (ele.textContent) {
        ele.textContent = localData[ele.id]["value"];
      }
    })
  );

  INPUTS.map((ele) =>
    ele.addEventListener("blur", () => {
      if (ele.textContent) {
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
