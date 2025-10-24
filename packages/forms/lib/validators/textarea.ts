import { z } from 'zod';
import { TextAreaFieldSchema } from '~/schema';
import FormValidator from './base';

export class TextAreaFormValidator extends FormValidator<
    z.infer<typeof TextAreaFieldSchema>
> {
    validate(data: any) {
        if (typeof data !== 'string') {
            throw new Error('Please enter some text.');
        }

        if (this.schema.minLength && data.length < this.schema.minLength) {
            throw new Error(
                'Your response seems a bit short. Could you please add a little more detail?'
            );
        }

        if (this.schema.maxLength && data.length > this.schema.maxLength) {
            throw new Error(
                'Your response is a bit long. Please shorten it to make it easier to read.'
            );
        }
    }
}
