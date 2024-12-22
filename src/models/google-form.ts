import { QuestionFieldData } from "./field-type";
import { GoogleFormResponse } from "./google-form-response";

// Main Google Form API Model
export interface GoogleForm {
    id: string;
    title: string;
    description: string;
    questionFieldData: QuestionFieldData[]; // This holds the questions that will be built in the question/form builder
    googleFormResponses: GoogleFormResponse[]; // This holds the related/linked responses to each google form
}
