import { OptionItem } from "./option-item";

export interface QuestionFieldData {
    id?: string;
    fieldType: FieldTypes;
    questionLabel: string;
    sequence: number;
    helpText?: string;
    options?: OptionItem[];
    isRequired?: boolean;
}

// Always create enum! It is ideal to create enum when comparing business types logic
export enum FieldTypes {
    TextInput = 'TEXT_INPUT_FIELD',
    CheckBox = 'CHECKBOX',
    RadioButton = 'RADIO_BUTTON',
    Textarea = 'TEXTAREA',
}

// Create an option collection that can be used an rendered in view
// This is efficient so that we can have source of truth
export const FIELD_TYPE_OPTIONS: OptionItem[] = [
    { label: 'Short Answer', value: FieldTypes.TextInput },
    { label: 'Paragraph', value: FieldTypes.Textarea },
    { label: 'Checkboxes', value: FieldTypes.CheckBox },
    { label: 'Multiple Choice', value: FieldTypes.RadioButton },
]
