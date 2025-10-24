import { z } from 'zod';
import { SelectFieldSchema } from '~/schema';
import FormValidator from './base';

export class SelectFormValidator extends FormValidator<
    z.infer<typeof SelectFieldSchema>
> {
    validate(data: any) {
        if (this.schema.multiple) {
            if (!Array.isArray(data) || data.length === 0) {
                throw new Error('Please choose at least one option.');
            }

            const invalidOptions = data.filter(
                (option) => !this.schema.options.includes(option)
            );

            if (invalidOptions.length > 0) {
                throw new Error(
                    `"${invalidOptions[0]}" is not a valid choice. Please select from the available options.`
                );
            }
        } else {
            if (!this.schema.options.includes(data)) {
                throw new Error('Please select a valid option from the list.');
            }
        }
    }
}
