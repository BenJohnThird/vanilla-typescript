import { showView } from "./utils/helpers";
import { GoogleForm } from "./models/google-form";
import { GoogleFormService } from "./services/google-form.service";
import { PageView } from "./enum/page-view";
import { appendQuestion, renderResponseQuestion } from "./utils/control-generator";
import {
  formSubmitFunc,
  questionContainerFunc,
  resetForm,
  resetResponseForm,
  responseSubmitFunc
} from "./utils/form-controls";
import { QuestionFieldData } from "./models/field-type";

const backToListButton = document.getElementById('back-to-list-button') as HTMLButtonElement;
const responseBackToListButton = document.getElementById('response-back-to-list-button') as HTMLButtonElement;
const addNewQuestionButton = document.getElementById('add-question-button') as HTMLButtonElement;
const googleFormService = new GoogleFormService();

// Load google forms from localStorage
const loadItems = (): GoogleForm[] => {
  return googleFormService.getAll();
};

// Render Google Forms
// Render Items
export const renderItems = (): void => {
  const formList = document.getElementById('google-form-list') as HTMLDivElement;
  const forms: GoogleForm[] = loadItems();
  formList.innerHTML = '';

  if (!forms?.length) {
    formList.classList.add('justify-content-center');
    const noFormsFound = document.createElement('div');
    noFormsFound.className = 'text-center';

    const titleHeading = document.createElement('span');
    titleHeading.className = 'title-heading';
    titleHeading.innerText = 'No Google Forms Found';

    const content = document.createElement('div');
    content.style.marginTop = '5px';
    content.innerText = 'Select a blank form or choose another template above to get started';

    noFormsFound.appendChild(titleHeading);
    noFormsFound.appendChild(content);
    formList.appendChild(noFormsFound);
    return;
  }

  formList.classList.remove('justify-content-center');

  forms?.forEach((form: GoogleForm) => {
    const formCardContent = `
      <div class="card-body">
        <h5 class="card-title">
            <i class="fa fa-list text-primary" aria-hidden="true"></i>
            ${form.title}
        </h5>   
        <div class="card-content">
            <b>ID:</b> ${form.id} <br>
            <b>Description:</b> ${form.description} <br>
            <b>Total Responses:</b> ${form.googleFormResponses?.length ?? 0} <br>
            <button type="button" class="btn google-form-log-btn-${form.id}" style="color: #51419A; font-size: 12px;">
                <i class="fa fa-eye" aria-hidden="true"></i> Log Response
            </button>  
        </div>
        <div class="d-flex align-items-center justify-content-between border-top pt-2">
            <button type="button" class="btn google-form-answer-btn-${form.id}" style="color: #51419A; font-size: 12px;">
                <i class="fa fa-user-plus" aria-hidden="true"></i> Answer Response
            </button>   
            <div>
                <button type="button" class="btn google-form-edit-btn-${form.id}">
                    <i class="fa fa-pencil text-primary" aria-hidden="true"></i>
                </button>   
                <button type="button" class="btn ps-3 border-start google-form-delete-btn-${form.id}">
                    <i class="fa fa-trash text-danger" aria-hidden="true"></i>
                </button> 
            </div>  
        </div>
      </div>
    `;

    const wrapper = document.createElement('div');
    wrapper.className = 'card google-form-card'
    wrapper.innerHTML = formCardContent;
    formList.appendChild(wrapper);

    // Attach Edit Listener
    const editBtn = document.querySelector(`.google-form-edit-btn-${form.id}`);
    if (editBtn) {
      editBtn.addEventListener('click', () => editForm(form));
    }

    // Attach Delete Listener
    const deleteBtn = document.querySelector(`.google-form-delete-btn-${form.id}`);
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        // Ask for confirmation
        const confirmed = confirm(`Are you sure you want to delete?`);
        if (!confirmed) return;

        deleteForm(form.id);
      });
    }

    // Attach Answer Response Listener
    const answerResponseBtn = document.querySelector(`.google-form-answer-btn-${form.id}`);
    if (answerResponseBtn) {
      answerResponseBtn.addEventListener('click', () => {
        answerResponse(form);
      });
    }

    // Attach Log Response Listener
    const logResponseBtn = document.querySelector(`.google-form-log-btn-${form.id}`);
    if (logResponseBtn) {
      logResponseBtn.addEventListener('click', () => {
        displayInConsoleAsTable(form);
      });
    }
  });
};

const renderLayoutTemplate = (): void => {
  const formTemplates = googleFormService.getFormTemplates();
  const formList = document.getElementById('forms-list') as HTMLDivElement;

  // Clear any existing content
  formList.innerHTML = '';

  // Loop through the templates and create cards
  // Loop through the templates and create cards
  formTemplates.forEach((template) => {
    // Create the template card div
    const templateCard = document.createElement('div');
    templateCard.className = 'template-card';

    // Add a click listener if the template is available
    if (template.isEnabled) {
      templateCard?.addEventListener('click', () => {
        showView(PageView.Form);
        resetForm();
        appendQuestion();
      });
    } else {
      // Add a class to indicate it is not clickable (optional styling)
      templateCard.classList.add('disabled');
    }

    // Create the card content
    const templateCardContent = document.createElement('div');
    templateCardContent.className = 'template-card-content';

    const iconContent = document.createElement('i');
    iconContent.className = 'fa fa-plus';
    iconContent.style.color = '#51419A';
    templateCardContent.appendChild(iconContent);

    // Add the availability message
    const warningMessage = document.createElement('div');
    warningMessage.className = 'warning-template-message text-truncate';
    warningMessage.textContent = template.isEnabled ? '' : 'Not Available';
    templateCardContent.appendChild(warningMessage);

    // Create the card title
    const templateCardTitle = document.createElement('div');
    templateCardTitle.className = 'template-card-title text-truncate';
    templateCardTitle.textContent = template.title;

    // Append elements to the template card
    templateCard.appendChild(templateCardContent);
    templateCard.appendChild(templateCardTitle);

    // Append the card to the form list
    formList.appendChild(templateCard);
  });
}

// Delete Item
const deleteForm = (id: string): void => {
  googleFormService.delete(id);
  renderItems();
};

export const editForm = (form: GoogleForm): void => {
  showView(PageView.Form);

  // Clear the questions container before rendering
  resetForm();

  // Setup these default values about the form
  const formEl: HTMLElement = document.getElementById('crud-form');
  formEl.querySelector('.form-title').setAttribute('value', form.title);
  formEl.querySelector('.form-description').setAttribute('value', form.description);
  formEl.querySelector('.form-placeholder-hidden').setAttribute('value', form.id);

  document.querySelector('.form-header-title').textContent = form.title;

  // Loop thru the form's question field data to render the question
  form.questionFieldData.forEach((questionFieldData) => {
    appendQuestion(questionFieldData);
  });
}

export const answerResponse = (form: GoogleForm): void => {
  showView(PageView.Response);

  resetResponseForm();

  // Setup these default values about the form
  const responseViewEl: HTMLDivElement = document.getElementById('response-view');
  responseViewEl.querySelector('.form-title').textContent = form.title;
  responseViewEl.querySelector('.form-description').textContent = form.description || '-';
  responseViewEl.querySelector('.form-placeholder-hidden').setAttribute('value', form.id);

  responseViewEl.querySelector('.form-header-title').textContent = form.title;

  // Loop thru the form's question field data to render the response question
  form.questionFieldData.forEach((questionFieldData: QuestionFieldData) => {
    renderResponseQuestion(questionFieldData);
  });
}

// This function only serves to display the response data beautifully in the console.
const displayInConsoleAsTable = (form: GoogleForm): void => {
  if (!form.googleFormResponses?.length) {
    console.log('This form does not have any responses yet');
    return;
  }

  // Loop thru google form responses
  for (const response of form.googleFormResponses) {

    // Create a temporary object that will be used for console.table
    let displayObject: { [key: string]: string | number } = {};

    // Loop thru the response object
    for (const key in response.responseData) {

      // Get the question id from the key. This is how we uniquely identify each key based on the modified questions
      // From the questionFieldData array
      const questionId = key.split("response-")[1];
      const questionData = form.questionFieldData.find(question => question.id === questionId);
      if (questionData) {
        displayObject = {
          ...displayObject,
          [questionData.questionLabel]: response.responseData[key]
        };
      }
    }

    console.table(displayObject);
  }

  alert('Response has been logged. Check your console. Hire me');
}

// Event Listeners
backToListButton.addEventListener('click', () => showView(PageView.List));
responseBackToListButton.addEventListener('click', () => showView(PageView.List));
addNewQuestionButton.addEventListener('click', () => appendQuestion());

document.addEventListener("DOMContentLoaded", (): void => {
  questionContainerFunc();
  formSubmitFunc();
  responseSubmitFunc();
}, { once: true });

// Initial render
renderLayoutTemplate();
renderItems();
