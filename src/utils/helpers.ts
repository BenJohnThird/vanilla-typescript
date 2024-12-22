// Show a specific view
import { PageView } from "../enum/page-view";

const listView = document.getElementById('list-view') as HTMLDivElement;
const formView = document.getElementById('form-view') as HTMLDivElement;
const responseView = document.getElementById('response-view') as HTMLDivElement;

// This function is being used to properly display the correct view
export const showView = (view: PageView): void => {
    if (view === PageView.List) {
        listView.style.display = 'block';
        formView.style.display = 'none';
        responseView.style.display = 'none';
        return;
    }

    if (view === PageView.Response) {
        responseView.style.display = 'block';
        listView.style.display = 'none';
        formView.style.display = 'none';
        return;
    }

    formView.style.display = 'block';
    listView.style.display = 'none';
    responseView.style.display = 'none';
};

// Reusable function to get the value by the given element and selector
export const getInputValue = (element: Element, selector: string) => {
    const inputEl = element?.querySelector(selector) as HTMLInputElement;
    if (inputEl && inputEl.value) {
        return inputEl.value.trim();
    }

    return "";
}
