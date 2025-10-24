import { z } from 'zod';
import { CheckboxFieldSchema } from '~/schema';
import FormValidator from './base';

export class CheckboxFormValidator extends FormValidator<
    z.infer<typeof CheckboxFieldSchema>
> {
    validate(data: any) {
        if (typeof data !== 'boolean') {
            throw new Error('Invalid value.');
        }

        if (this.schema.required && !data) {
            throw new Error('This field is required.');
        }
    }
}
