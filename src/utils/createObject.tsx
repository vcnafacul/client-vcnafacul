import { FormFieldInput } from "../components/molecules/formField";

export function createObjectFromFormFieldInput(fields: FormFieldInput[]): Record<string, string | number | readonly string[] | undefined> {
    const result: Record<string, string | number | readonly string[] | undefined> = {};

    fields.forEach(field => {
        if (field.type === 'text') {
            result[field.id] = field.value ?? '';
        } else if (field.type === 'password') {
            result[field.id] = '';
        } else if (field.type === 'number') {
            result[field.id] = field.value ?? 0;
        }
    });

    return result;
}