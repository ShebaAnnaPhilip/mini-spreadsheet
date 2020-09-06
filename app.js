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
        updateLocalStorage(localData);
      }
      else{
          updateLocalStorage(localData)
      }
    })
  );
};

document.addEventListener("DOMContentLoaded", function () {
  drawTable();
  onCellInput();
});
