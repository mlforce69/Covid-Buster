import {data} from "./data"


export function createDescriptionModal(powerUpId, isHidden = true) {
  const descriptionTextContainer = document.querySelector("#wrapper");
  console.log(descriptionTextContainer);

  const display = isHidden ? "none" : "block";
  console.log(display);
  const html = `
            <div class="overlayQuestionText" id="overlayQuestionText">
              <div class="modal">
                <p id="questionTitle">${data.questions[powerUpId].title}</p>
                <p id="questionText">
                  ${data.questions[powerUpId].text}
                </p>
              </div>
            </div>`;
  descriptionTextContainer.innerHTML = html;

  hideShowClassHidden(descriptionTextContainer, isHidden);

  console.log(descriptionTextContainer);
}

// createDescriptionModal(1)

export function createQuestionModal(powerUpId, isHidden = true) {
  const descriptionTextContainer = document.querySelector("#wrapper");

  const html = `
    <div class="modal">
        <form action="#" id="form">
          <p>${data.questions[powerUpId].questionText}</p>
          <input type="radio" id="answer1" name="answer" required value="${data.questions[powerUpId].answers.a.isTrue}">
          <label for="answer1">${data.questions[powerUpId].answers.a.answerText}</label><br>
          <input type="radio" id="answer2" name="answer" value="${data.questions[powerUpId].answers.b.isTrue}">
          <label for="answer2">${data.questions[powerUpId].answers.b.answerText}</label><br>  
          <input type="radio" id="answer3" name="answer" value="${data.questions[powerUpId].answers.c.isTrue}">
          <label for="answer3">${data.questions[powerUpId].answers.c.answerText}</label><br><br>
          <input type="submit" value="Submit " >
  
        </form>
    </div>`;
  // onclick="submitClicked()
  descriptionTextContainer.innerHTML = html;
  hideShowClassHidden(descriptionTextContainer, isHidden);
  let level = submitClicked(descriptionTextContainer);
  console.log(level)
  return level;
}

// TODO refactor submitClicked to return the level and hide the pop up

function hideShowClassHidden(element, isHidden) {
  if (isHidden) {
    element.classList.add("hidden");
  } else {
    element.classList.remove("hidden");
  }
}

function submitClicked(element) {
  let levelToContinue = 1;
  const form = document.getElementById("form");
  const formElements = Array.from(form.elements);
  const submitButton = formElements[formElements.length - 1];

  submitButton.addEventListener("click", (event) => {
    for (let i = 0; i < formElements.length - 1 - 1; i++) {
      console.log(typeof formElements[i].value);
      if (formElements[i].checked && formElements[i].value == "true") {
        console.log("Checked " + formElements[i].value);
        levelToContinue = 2;
        console.log(levelToContinue);
        element.style["display"] = "none";
        event.preventDefault();
        break;
      } else if(formElements[i].checked && formElements[i].value == "false"){
        levelToContinue = 1;
        element.style["display"] = "none";
        event.preventDefault();
      }
    }
  });

  return levelToContinue;
}
