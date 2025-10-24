import { TextFormValidator } from './text';
import { TextAreaFormValidator } from './textarea';
import { NumberFormValidator } from './number';
import { CheckboxFormValidator } from './checkbox';
import { DateFormValidator } from './date';
import { DateRangeFormValidator } from './date-range';
import { FileFormValidator } from './file';
import { SelectFormValidator } from './select';
import z from 'zod';
import {
    CheckboxFieldSchema,
    DateFieldSchema,
    DateRangeFieldSchema,
    FileFieldSchema,
    NumberFieldSchema,
    SelectFieldSchema,
    TextAreaFieldSchema,
    TextFieldSchema,
} from '~/schema';

export type FieldSchemaType =
    | z.infer<typeof TextFieldSchema>
    | z.infer<typeof TextAreaFieldSchema>
    | z.infer<typeof NumberFieldSchema>
    | z.infer<typeof CheckboxFieldSchema>
    | z.infer<typeof DateFieldSchema>
    | z.infer<typeof DateRangeFieldSchema>
    | z.infer<typeof FileFieldSchema>
    | z.infer<typeof SelectFieldSchema>;

export function getValidator(field: FieldSchemaType) {
    switch (field.type) {
        case 'text':
            return new TextFormValidator(field);
        case 'textarea':
            return new TextAreaFormValidator(field);
        case 'number':
            return new NumberFormValidator(field);
        case 'checkbox':
            return new CheckboxFormValidator(field);
        case 'date':
            return new DateFormValidator(field);
        case 'dateRange':
            return new DateRangeFormValidator(field);
        case 'file':
            return new FileFormValidator(field);
        case 'select':
            return new SelectFormValidator(field);
        default:
            throw new Error(`Invalid field type"`);
    }
}
