export interface GoogleFormResponse {
    id: string;
    responseData: { [key: string]: string | number }; // Add an object key value pair that will represent as the response
}
