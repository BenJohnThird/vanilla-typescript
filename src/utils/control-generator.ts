import { generateGuid } from "./generate-guid";
import { FIELD_TYPE_OPTIONS, FieldTypes, QuestionFieldData } from "../models/field-type";

// Reusable function that appends the question card
export const appendQuestion = (question?: QuestionFieldData): void => {
    const questionId = question?.id ?? generateGuid();
    const fieldType = question?.fieldType ?? null;
    const required = question?.isRequired;
    const questionValue = question?.questionLabel ?? 'Question';

    const htmlContent = `
        <div class="form-card border rounded p-4 mt-3 shadow" data-question-id="${questionId}">
          <div class="row">
            <div class="col-12 col-md-8">
              <input type="text" class="form-control" placeholder="Question" value="${questionValue}">
            </div>
            <div class="col">
              <select class="form-select" id="field-type-select">
                ${generateSelectOptions(fieldType)}
              </select>
            </div>
          </div>
          
          <div class="dynamic-inputs mt-3"></div> <!-- Placeholder for dynamic inputs -->
          
           <hr>
           
           <div class="d-flex align-items-center justify-content-end">
                <button type="button" class="btn text-danger px-2 py-0" id="question-delete-btn">
                    <i class="fa fa-trash"></i>
                </button>
                <div class="form-check form-switch ps-5 border-start">
                  <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault-${questionId}" ${required ? 'checked' : ''}>
                  <label class="form-check-label" for="flexSwitchCheckDefault-${questionId}">Required</label>
                </div>
            </div>
        </div>`;

    // Append the question HTML to the container
    const questionsContainer = document.getElementById('question-container');
    questionsContainer.innerHTML += htmlContent;

    const selectElement: HTMLSelectElement | null = questionsContainer.querySelector('select');
    if (!selectElement) {
        return;
    }

    // Dispatch the 'change' event to trigger the listener
    const changeEvent = new Event('change', { bubbles: true });
    selectElement.dispatchEvent(changeEvent);
}

// Reusable function that render the response
export const renderResponseQuestion = (question: QuestionFieldData): void => {
    const htmlContent = `
        <div class="form-card border rounded p-4 mt-3 shadow" data-question-id="${question.id}" data-field-type="${question.fieldType}">
          <div class="row">
            <div class="col-8">
              <b>${question?.questionLabel}</b>
            </div>
          </div>
          
          ${getInputField(question)}
        </div>`;

    // Append the question HTML to the container
    const responsesContainer = document.getElementById('response-container');
    responsesContainer.innerHTML += htmlContent;
}


// Function to return appropriate input field for each question
function getInputField(question: QuestionFieldData) {
    switch (question.fieldType) {
        case FieldTypes.TextInput:
            return `<input type="text" class="form-control" name="response-${question.id}" ${question.isRequired ? 'required': ''}/>`;
        case FieldTypes.Textarea:
            return `
                <textarea class="form-control" name="response-${question.id}" ${question.isRequired ? 'required': ''} />
                </textarea>
            `;
        case FieldTypes.RadioButton:
            return question.options?.map(
                    (option) => `
                        <div class="form-check">
                          <input type="radio" class="form-check-input" name="response-${question.id}" value="${option.value}" ${question.isRequired ? 'required': ''}/>
                          <label class="form-check-label">${option.label}</label>
                        </div>
                      `
                )
                .join("");
        case FieldTypes.CheckBox:
            return question.options?.map(
                (option) => `
                        <div class="form-check">
                          <input type="checkbox" class="form-check-input" name="response-${question.id}" value="${option.value}" ${question.isRequired ? 'required': ''}/>
                          <label class="form-check-label">${option.label}</label>
                        </div>
                      `
            )
                .join("");
        default:
            return "";
    }
}

// Reusable functions that generate the needed field type

export const generateShortAnswer = (): string => {
    return `
        <input type="text" class="form-control" placeholder="Short Answer" disabled/>
    `;
}

export const generateParagraph = (): string => {
    return `
        <textarea class="form-control" placeholder="Paragraph Answer" disabled/>
    `;
}

export const generateCheckboxes = (): string => {
    return `
        <div class="checkbox-container">         
            <button 
                type="button"
                class="btn btn-primary mt-2"
                id="add-new-option">
                Add New Option
             </button>
        </div>
    `;
}

export const generateCheckboxOption = (target: HTMLElement): void => {
    // Find the closest checkbox container
    const checkboxContainer: HTMLElement | null = target.closest(".checkbox-container");
    if (!checkboxContainer) {
        return;
    }

    // Create a new checkbox row
    const newRow = document.createElement("div");
    newRow.className = "checkbox-row d-flex align-items-center mt-2";
    newRow.innerHTML = `
            <div class="d-flex align-items-center justify-content-between w-100">
                <div class="d-flex align-items-center w-75">
                    <div class="form-check mr-2">
                        <input class="form-check-input" type="checkbox" disabled>
                    </div>
                    <input type="text" class="form-control" value="Option ${checkboxContainer.querySelectorAll(".checkbox-row").length + 1}"/>
                </div>
                <div class="checkbox-close">
                    <button class="checkbox-close-btn btn btn-danger btn-sm" type="button">
                        <i class="fa fa-times"></i>
                    </button>
                </div>
            </div>
          `;
    checkboxContainer.insertBefore(newRow, target);
    updateCloseButtons(checkboxContainer, '.checkbox-row', '.checkbox-close-btn');
}

export const generateMultipleChoice = (): string => {
    return `
        <div class="multiple-choice-container">         
            <button 
                type="button"
                class="btn btn-primary mt-2"
                id="add-new-option-radio">
                Add New Option
             </button>
        </div>
    `;
}


export const generateMultipleChoiceOption = (target: HTMLElement): void => {
    // Find the closest multiple choice container
    const multipleChoiceContainer: HTMLElement | null = target.closest(".multiple-choice-container");
    if (!multipleChoiceContainer) {
        return;
    }

    // Create a new checkbox row
    const newRow = document.createElement("div");
    newRow.className = "multiple-choice-row d-flex align-items-center mt-2";
    newRow.innerHTML = `
            <div class="d-flex align-items-center justify-content-between w-100">
                <div class="d-flex align-items-center w-75">
                    <div class="form-check mr-2">
                        <input class="form-check-input" type="radio" disabled>    
                    </div>
                    <input type="text" class="form-control" value="Option ${multipleChoiceContainer.querySelectorAll(".multiple-choice-row").length + 1}"/>
                </div>
                <div class="multiple-choice-close">
                    <button class="multiple-choice-close-btn btn btn-danger btn-sm" type="button">
                        <i class="fa fa-times"></i>
                    </button>
                </div>
            </div>
          `;
    multipleChoiceContainer.insertBefore(newRow, target);
    updateCloseButtons(multipleChoiceContainer, '.multiple-choice-row', '.multiple-choice-close-btn');
}

export function updateCloseButtons(container: HTMLElement, rowClass: string, closeBtnClass: string) {
    const rows = container.querySelectorAll(rowClass);
    rows.forEach((row, index) => {
        const closeButton = row.querySelector(closeBtnClass) as HTMLButtonElement;
        if (closeButton) {
            closeButton.classList.toggle("d-none", rows.length <= 1);
        }
    });
}

function generateSelectOptions(selectedValue: FieldTypes | null): string {
    return FIELD_TYPE_OPTIONS
        .map(option => {
            return `
            <option value="${option.value}" ${option.value === selectedValue ? 'selected' : ''}>
                ${option.label}
            </option>
            `
        })
        .join('');
}
