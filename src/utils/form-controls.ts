import { FieldTypes, QuestionFieldData } from "../models/field-type";
import {
    generateCheckboxes,
    generateCheckboxOption,
    generateMultipleChoice,
    generateMultipleChoiceOption,
    generateParagraph,
    generateShortAnswer,
    updateCloseButtons
} from "./control-generator";
import { GoogleForm } from "../models/google-form";
import { getInputValue, showView } from "./helpers";
import { OptionItem } from "../models/option-item";
import { generateGuid } from "./generate-guid";
import { GoogleFormService } from "../services/google-form.service";
import { renderItems } from "../main";
import { PageView } from "../enum/page-view";
import { GoogleFormResponse } from "../models/google-form-response";


// Create a function that adds the needed event listener for questions-container
// Question Container is the view for rendering the Questions/Form Builder
export const questionContainerFunc = (): void => {
    const container = document.getElementById("question-container");
    if (!container) {
        return;
    }

    container.addEventListener("change", (event) => selectUpdate(event));
    container.addEventListener("click", (event) => clickUpdate(event));
}

// Function that checks any SELECT change
// Normally in Angular, we can just use ngModelChange for this
const selectUpdate = (event: Event): void => {
    const target = event.target as HTMLElement;

    if (target && target.tagName === "SELECT") {
        const selectElement = target as HTMLSelectElement;

        // Get the parent question ID
        const questionCard = selectElement.closest(".form-card");
        const dynamicInputsContainer = questionCard?.querySelector(".dynamic-inputs");
        if (!dynamicInputsContainer) {
            return;
        }

        // Clear previous inputs
        dynamicInputsContainer.innerHTML = "";
        const selectElementValue: FieldTypes = selectElement.value as FieldTypes;

        // Render the innerHTML based on the Field Types
        switch (selectElementValue) {
            case FieldTypes.TextInput:
                dynamicInputsContainer.innerHTML = generateShortAnswer();
                break;

            case FieldTypes.Textarea:
                dynamicInputsContainer.innerHTML = generateParagraph();
                break;

            case FieldTypes.CheckBox:
                dynamicInputsContainer.innerHTML = generateCheckboxes();

                // TODO: This can be transferred to a reusable function
                const addOptionEl = dynamicInputsContainer.querySelector('#add-new-option');
                if (!addOptionEl) {
                    return;
                }

                (addOptionEl as HTMLButtonElement).click();
                break;

            case FieldTypes.RadioButton:
                dynamicInputsContainer.innerHTML = generateMultipleChoice();

                // TODO: This can be transferred to a reusable function
                const addOptionRadioEl = dynamicInputsContainer.querySelector('#add-new-option-radio');
                if (!addOptionRadioEl) {
                    return;
                }

                (addOptionRadioEl as HTMLButtonElement).click();
                break;

            default:
                break;
        }
    }
}

// This function that listens to every mouse event or click changes in the Question Container/Form Builder
const clickUpdate = (event: Event): void => {
    const target = event.target as HTMLElement;

    // If Add New Option button is clicked, generate new checkbox option
    if (target.id === "add-new-option") {
        generateCheckboxOption(target);
        return;
    }

    // If Checkbox close button is clicked, remove the element
    if (
        target.classList.contains('checkbox-close-btn') ||
        target.closest('.checkbox-close')
    ) {
        genericRemove(target, '.checkbox-row', '.checkbox-container', '.checkbox-close-btn')
        return;
    }

    // If Add New Option button is clicked, generate new radio option
    if (target.id === "add-new-option-radio") {
        generateMultipleChoiceOption(target);
        return;
    }

    // If Radio close button is clicked, remove the element
    if (
        target.classList.contains('multiple-choice-close-btn') ||
        target.closest('.multiple-choice-close')
    ) {
        genericRemove(target, '.multiple-choice-row', '.multiple-choice-container', '.multiple-choice-close-btn')
        return;
    }

    // If the Question delete button is clicked, remove the question
    const removeButtonEl = target.closest('#question-delete-btn');
    if (
        removeButtonEl && (
            target.classList.contains('fa-trash') ||
            target.closest('#question-delete-btn')
        )
    ) {
        const questionCard = removeButtonEl.closest('.form-card');
        if (!questionCard) {
            return;
        }

        questionCard.remove();
    }
}

// Create a function that adds the needed event listener for response-container
// Response Container is the view for rendering the Responses Form (Form where user will add their answers)
export const responseSubmitFunc = (): void => {
    const submitButton = document.getElementById('response-form-submit');
    if (!submitButton) {
        return;
    }

    submitButton.addEventListener("click", (event) => responseSubmitUpdate())
}

// function that listens to every mouse event or click changes in the Response Container
const responseSubmitUpdate = () => {
    const container = document.getElementById("response-container");
    const formCards = container?.querySelectorAll('.form-card');
    let isValid = true;

    formCards?.forEach((card, index: number) => {
        // No need to validate the first index;
        if (index === 0) {
            return;
        }

        isValid = validateResponseCard(card, isValid);
    });

    if (!isValid) {
        return;
    }

    prepareResponseData(formCards);
}

// Function that listens to CRUD Form Submit (Or when creating or updating new form)
export const formSubmitFunc = (): void => {
    const submitButton = document.getElementById('crud-form-submit');
    if (!submitButton) {
        return;
    }

    submitButton.addEventListener("click", (event) => formSubmitUpdate())
}

// Function that loops and handle form submission logic
const formSubmitUpdate = () => {
    const container = document.getElementById("question-container");
    const formCards = container?.querySelectorAll('.form-card');
    let isValid = true;


    // Loop thru each question forms to handle validation
    formCards?.forEach((card, index: number) => {
        // Validate the header form card
        if (index === 0) {
            const titleInput = card.querySelector('.form-title') as HTMLInputElement;
            if (titleInput && !titleInput.value.trim()) {
                isValid = false
                titleInput.classList.add("is-invalid");
            } else {
                titleInput.classList.remove("is-invalid");
            }
            return;
        }

        isValid = validateQuestionCard(card, isValid);
    });

    // If invalid, do not proceed
    if (!isValid) {
        return;
    }

    prepareData(formCards);
}

// Reusable function that validates each question card
function validateQuestionCard(card: Element, isValid: boolean): boolean {

    // Validate Question Input
    const questionInput = card.querySelector("input[placeholder='Question']") as HTMLInputElement;
    if (questionInput && !questionInput.value.trim()) {
        isValid = false
        questionInput.classList.add("is-invalid");
    } else {
        questionInput.classList.remove("is-invalid");
    }

    const selectFieldElement = card.querySelector('select');
    const selectFieldValue = selectFieldElement?.value as FieldTypes;

    switch (selectFieldValue) {
        case FieldTypes.CheckBox:
            const checkBoxRows = card.querySelectorAll('.checkbox-row');

            checkBoxRows.forEach((row: Element) => {
                const inputElement = row.querySelector('input[type="text"]') as HTMLInputElement;
                if (inputElement && !inputElement.value.trim()) {
                    isValid = false
                    inputElement.classList.add("is-invalid");
                } else {
                    inputElement.classList.remove("is-invalid");
                }
            });

            break;

        case FieldTypes.RadioButton:
            const multipleChoiceRow = card.querySelectorAll('.multiple-choice-row');

            multipleChoiceRow.forEach((row: Element) => {
                const inputElement = row.querySelector('input[type="text"]') as HTMLInputElement;
                if (inputElement && !inputElement.value.trim()) {
                    isValid = false
                    inputElement.classList.add("is-invalid");
                } else {
                    inputElement.classList.remove("is-invalid");
                }
            });
            break;

        default:
            break;
    }

    return isValid;
}

// Validate Response card
function validateResponseCard(card: Element, isValid: boolean): boolean {
    const fieldType: FieldTypes = card.dataset.fieldType;

    switch (fieldType) {
        case FieldTypes.TextInput:
            const inputElement = card.querySelector('input[type="text"]') as HTMLInputElement;
            if (getInputValue(card, 'input[type="text"]') === '') {
                isValid = false
                inputElement.classList.add("is-invalid");
            } else {
                inputElement.classList.remove("is-invalid");
            }
            break;
    }

    return isValid;
}

// Reusable function the removes an element
function genericRemove(target: HTMLElement, rowClass: string, containerClass: string, closeBtnClass: string): void {
    const rowElement = target.closest(rowClass);
    const containerElement = target.closest(containerClass);

    if (rowElement && containerElement) {
        rowElement.remove();

        updateCloseButtons(containerElement as HTMLElement, rowClass, closeBtnClass);
    }
}

// Prepare the response data provided by the user to save and link to google form respons
function prepareResponseData(formCards: NodeListOf<Element> | undefined): void {
    let editingFormId = '';

    const fieldTypeData: GoogleFormResponse = {
        id: generateGuid(),
        responseData: {},
    };

    formCards?.forEach((card: Element, index: number) => {
        if (index === 0) {
            editingFormId = getInputValue(card, '.form-placeholder-hidden');
            return;
        }

        // Get the field type to properly identify the needed logic
        const fieldType: FieldTypes = card.dataset.fieldType;

        // Get the question id
        const questionId = card.dataset.questionId;

        // Prepare the name for each key
        const name = `response-${questionId}`;

        switch (fieldType) {
            case FieldTypes.CheckBox:
            case FieldTypes.RadioButton:
                const checkedValue = card.querySelector(`input[name="${name}"]:checked`) as HTMLInputElement;
                fieldTypeData.responseData = {
                    ...fieldTypeData.responseData,
                    [name]: checkedValue.value,
                }
                break;

            case FieldTypes.TextInput:
                fieldTypeData.responseData = {
                    ...fieldTypeData.responseData,
                    [name]: getInputValue(card, `input[name="${name}"]`),
                };
                break;

            case FieldTypes.Textarea:
                fieldTypeData.responseData = {
                    ...fieldTypeData.responseData,
                    [name]: getInputValue(card, `textarea`),
                };
                break;

            default:
                break;
        }
    });

    // Call the google form service
    const googleFormService = new GoogleFormService();

    // Get the google form that will be used to link
    const googleForm = googleFormService.getById(editingFormId);
    if (!googleForm) {
        return;
    }

    // This is just for safe-keeping, if google form responses is not array, declare a new array
    if (!Array.isArray(googleForm.googleFormResponses)) {
        googleForm.googleFormResponses = [];
    }

    googleForm.googleFormResponses.push(fieldTypeData);
    googleFormService.update(googleForm);

    resetResponseForm();

    showView(PageView.List);
    renderItems();
}

function prepareData(formCards: NodeListOf<Element> | undefined): void {
    let googleForm: GoogleForm = {
        description: "",
        questionFieldData: [],
        id: "",
        title: "",
        googleFormResponses: [],
    };

    let editingFormId = '';

    formCards?.forEach((card: Element, index: number) => {
        if (index === 0) {
            editingFormId = getInputValue(card, '.form-placeholder-hidden');
            googleForm.title = getInputValue(card, '.form-title');
            googleForm.description = getInputValue(card, '.form-description');
            return;
        }

        const formCheckEl: HTMLElement = card.querySelector('.form-check-input');

        const selectFieldTypeValue = getInputValue(card, '#field-type-select') as FieldTypes;
        const fieldTypeData: QuestionFieldData = {
            fieldType: selectFieldTypeValue,
            questionLabel: getInputValue(card, "input[placeholder='Question']"),
            sequence: index,
            isRequired: formCheckEl?.checked,
            options: [],
            id: generateGuid(),
        };

        switch (selectFieldTypeValue) {
            case FieldTypes.CheckBox:
                const checkBoxRows = card.querySelectorAll('.checkbox-row');
                checkBoxRows.forEach((row: Element) => {
                    const checkboxOption: OptionItem = {
                        label: getInputValue(row, 'input[type="text"]'),
                        value: getInputValue(row, 'input[type="text"]'),
                    };

                    fieldTypeData.options?.push(checkboxOption);
                });
                break;

            case FieldTypes.RadioButton:
                const multipleChoiceRows = card.querySelectorAll('.multiple-choice-row');
                multipleChoiceRows.forEach((row: Element) => {
                    const multipleChoiceOption: OptionItem = {
                        label: getInputValue(row, 'input[type="text"]'),
                        value: getInputValue(row, 'input[type="text"]'),
                    };

                    fieldTypeData.options?.push(multipleChoiceOption);
                });
                break;

            default:
                break;
        }

        googleForm.questionFieldData.push(fieldTypeData);
    });

    const googleFormService = new GoogleFormService();

    if (editingFormId.trim() === '') {
        googleForm.id = generateGuid();
        googleFormService.create(googleForm);
    } else {
        googleForm.id = editingFormId;
        googleFormService.update(googleForm);
    }

    resetForm();

    showView(PageView.List);
    renderItems();

}

// Function that resets the Question Create and Update Form Builder
export function resetForm(): void {
    // Reset the Form
    document.getElementById('crud-form')?.reset();

    document.querySelector('.form-title').setAttribute('value', '');
    document.querySelector('.form-description').setAttribute('value', '');
    document.querySelector('.form-placeholder-hidden').setAttribute('value', '');

    document.querySelector('.form-header-title').textContent = 'Untitled Form';

    const questionCards = document.querySelectorAll('.form-card[data-question-id]');
    questionCards.forEach(card => {
        card.remove(); // Removes each card element from the DOM
    });
}

export function resetResponseForm(): void {
    const responseCards  = document.querySelectorAll('.form-card[data-question-id]');
    responseCards.forEach(card => {
        card.remove(); // Removes each card element from the DOM
    });
}
