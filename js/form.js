export class Form {
  constructor(formElement) {
    this.form = formElement;
    this.inputFields = {};

    this.initInputFields();
    this.form.addEventListener("input", (e) => {
      let inputObj = this.inputFields[e.target.name];
      this.validateInput(inputObj);
    });
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.validateForm(this.form);
    });
  }

  initInputFields() {
    let inputFields = this.inputFields;

    for (let input of this.form) {

      if (input.tagName == "BUTTON") continue;

      inputFields[input.name] = {
        input: input,
        errorMsg: "",
      };
      input.addEventListener("focus", () =>
        this.clearErrorElement(inputFields[input.name])
      );
      input.addEventListener("blur", () =>
        this.validateInput(inputFields[input.name])
      );
    }
  }

  isValidText(input, pattern) {
    return pattern.test(input.value);
  }

  isValidDate(inputObj) {
    let input = inputObj.input;
    let now = Date.now();

    if (!input.value) return false;
    
    input = Date.parse(input.value);
    return input < now;
  }

  nameErrorMsg(input) {
    let inputName = input.name == "name" ? "name" : "last name";

    if (!input.value) return `Empty ${inputName}`;
    if (this.isValidText(input, / /)) {
      return `Your ${inputName} can't have spaces`;
    }
    if (!this.isValidText(input, /^[a-zA-Z]+$/)) {
      return `Your ${inputName} can only have letters of the alphabet`;
    }
    if (!this.isValidText(input, /^[A-Z]/)) {
      return `Your ${inputName} should start with a capital letter`;
    }
    if (this.isValidText(input, /^[A-Z]{2,}/)) {
      return `Your ${inputName} should start with only 1 capital letter`;
    }
    if (this.isValidText(input, /^[A-Z]$/)) {
      return `Your ${inputName} needs to have at least 2 characters`;
    }
    if (this.isValidText(input, /^[a-zA-Z]+$/)) {
      return `Your ${inputName} has more than 1 capital letter`;
    }
  }

  validateInput(inputObj) {
    let isValid;
    let input = inputObj.input;

    switch (input.name) {
      case "name":
      case "lastname":
        isValid = this.isValidText(input, /^[A-Z][a-z]+$/);
        if (!isValid) inputObj.errorMsg = this.nameErrorMsg(input);
        break;

      case "email":
        isValid = this.isValidText(
          input,
          /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
        );
        if (!isValid) inputObj.errorMsg = "Enter a valid email address";
        break;

      case "event":
        isValid = input.value;
        if (!isValid) inputObj.errorMsg = "Choose an event";
        break;

      case "date":
        isValid = this.isValidDate(inputObj);
        if (!input.value) {
          inputObj.errorMsg = "Invalid date";
          break;
        }
        if (!isValid) inputObj.errorMsg = "Date can't be later than today";
    }

    if (isValid) {
      this.clearErrorElement(inputObj);
    } else {      
      if (input.classList.contains("checklist__error")) {
        input.nextSibling.textContent = inputObj.errorMsg;
        return;
      }
      this.createErrorElement(inputObj);
    }
  }

  createErrorElement(inputObj) {
    let errorElement = document.createElement("div");

    inputObj.input.classList.add("checklist__error");
    errorElement.classList.add("checklist__error_msg");
    errorElement.textContent = inputObj.errorMsg;
    inputObj.input.style.marginBottom = "1px";
    inputObj.input.after(errorElement);
  }

  clearErrorElement(inputObj) {
    let classList = inputObj.input.classList;

    if (classList.contains("checklist__error")) {
      classList.remove("checklist__error");
      inputObj.input.nextSibling.remove();
      inputObj.input.style.marginBottom = "";
      inputObj.errorMsg = "";
    }
  }

  validateForm(formChecklist) {
    let isValid = true;

    for (let input of formChecklist) {
      if (input.tagName == "BUTTON") continue;
      this.validateInput(this.inputFields[input.name]);

      if (!input.value) {
        if (!input.classList.contains("checklist__error")) {
          this.createErrorElement(this.inputFields[input.name]);
        }
        input.nextSibling.textContent = "Required field";
      }

      if (input.classList.contains("checklist__error")) {
        isValid = false;
      }
    }

    if (isValid) {
      this.sendForm(formChecklist);
    }
  }

  sendForm(formChecklist) {
    for (let input of formChecklist) {
      if (input.tagName == "BUTTON") continue;
      console.log(`${input.name}: ${input.value}`);
    }

    formChecklist.hidden = true;
    let notificationElement = document.createElement("div");
    notificationElement.textContent =
      "We sent your Change.it checklist to your email!";
    notificationElement.classList.add("checklist__notification");
    document.querySelector(".checklist__form").append(notificationElement);
  }
}