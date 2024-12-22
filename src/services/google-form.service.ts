import { GoogleForm } from "../models/google-form";
import { FormTemplates } from "../models/form-templates";

/**
 * This will serves like an Angular Service that mocks an HTTP Call
 * But for this test; we will just save it in the localStorage
 */
export class GoogleFormService {
    private storageKey = 'google-form-key';

    constructor() { }

    // Gets the data from the storage
    public getAll(): GoogleForm[] {
        const data = localStorage.getItem(this.storageKey);
        const googleForms: GoogleForm[] = data ? JSON.parse(data) : [];

        for (const googleForm of googleForms) {
            // This ensures that we are getting responses that has data
            if (googleForm.googleFormResponses?.length) {
                googleForm.googleFormResponses = googleForm.googleFormResponses.filter(response => Object.keys(response.responseData).length > 0);
            }
        }

        return googleForms;
    }

    // Get the data by id
    public getById(id: string): GoogleForm | undefined {
        return this.getAll().find(record => record.id === id);
    }

    // Create new Google Form
    public create(record: GoogleForm): void {
        const records = this.getAll();

        const existingRecord = records.find(listRecord => listRecord.title === record.title);
        if (existingRecord) {
            return;
        }

        records.push(record);
        this.saveToLocalStorage(records);
    }

    // Update existing Google Form
    public update(record: GoogleForm): void {
        const records = this.getAll();
        const index = records.findIndex(item => item.id === record.id);
        if (index < 0) {
            throw new Error(`Record with ID ${record.id} not found.`);
        }

        records[index] = record;
        this.saveToLocalStorage(records);
    }

    // Delete Google Form by Id
    public delete(id: string): void {
        const records = this.getAll().filter(record => record.id !== id);
        this.saveToLocalStorage(records);
    }

    // Main saving to local storage
    public saveToLocalStorage(records: GoogleForm[]): void {
        localStorage.setItem(this.storageKey, JSON.stringify(records));
    }

    // What is this? This is just to imitate Google Form's templates that can be used for creating Google Form
    // But this is just for aesthetics only.
    public getFormTemplates(): FormTemplates[] {
        return [
            {
                id: '1',
                isEnabled: true,
                title: 'Blank Form',
            },
            {
                id: '2',
                isEnabled: false,
                title: 'Contact Information',
            },
            {
                id: '3',
                isEnabled: false,
                title: 'RSVP',
            },
            {
                id: '4',
                isEnabled: false,
                title: 'Party Invite',
            },
            {
                id: '5',
                isEnabled: false,
                title: 'T-Shirt Sign Up',
            },
            {
                id: '5',
                isEnabled: false,
                title: 'Ben new Senior Frontend Developer',
            },
        ];
    }
}
