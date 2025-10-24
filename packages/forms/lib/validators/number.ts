import { z } from 'zod';
import { NumberFieldSchema } from '~/schema';
import FormValidator from './base';

export class NumberFormValidator extends FormValidator<
    z.infer<typeof NumberFieldSchema>
> {
    validate(data: any) {
        if (typeof data !== 'number' || isNaN(data)) {
            throw new Error('Please enter a valid number.');
        }

        if (this.schema.min !== undefined && data < this.schema.min) {
            throw new Error(`The number must be at least ${this.schema.min}.`);
        }

        if (this.schema.max !== undefined && data > this.schema.max) {
            throw new Error(`The number must be ${this.schema.max} or less.`);
        }
    }
}
