import { z } from 'zod';
import { TextFieldSchema } from '~/schema';
import FormValidator from './base';

export class TextFormValidator extends FormValidator<
    z.infer<typeof TextFieldSchema>
> {
    validate(data: any) {
        if (typeof data !== 'string') {
            throw new Error('Please enter a valid response.');
        }

        if (this.schema.minLength && data.length < this.schema.minLength) {
            throw new Error(
                `Please enter at least ${this.schema.minLength} character(s).`
            );
        }

        if (this.schema.maxLength && data.length > this.schema.maxLength) {
            throw new Error(
                `Please keep your answer under ${this.schema.maxLength} characters.`
            );
        }

        const { validationType, validationValue } = this.schema as any;

        if (!validationType || validationType === 'none') return;

        switch (validationType) {
            case 'email':
                if (!/^\S+@\S+\.\S+$/.test(data)) {
                    throw new Error("That doesn't look like a valid email.");
                }
                break;

            case 'phone':
                if (!/^\+?[0-9]{7,15}$/.test(data)) {
                    throw new Error(
                        'Please enter a valid 10 digit phone number.'
                    );
                }
                break;

            case 'url':
                try {
                    new URL(data);
                } catch {
                    throw new Error(
                        'Please enter a valid link or web address.'
                    );
                }
                break;

            case 'pincode':
                if (!/^[0-9]{5,6}$/.test(data)) {
                    throw new Error(
                        'Please enter a valid pin code (5-6 digits).'
                    );
                }
                break;

            case 'equals':
                if (data !== validationValue) {
                    throw new Error(
                        `Your answer must match exactly: "${validationValue}".`
                    );
                }
                break;

            case 'contains':
                if (!data.includes(validationValue)) {
                    throw new Error(
                        `Your answer must include: "${validationValue}".`
                    );
                }
                break;

            case 'startsWith':
                if (!data.startsWith(validationValue)) {
                    throw new Error(
                        `Your answer should begin with: "${validationValue}".`
                    );
                }
                break;

            case 'endsWith':
                if (!data.endsWith(validationValue)) {
                    throw new Error(
                        `Your answer should end with: "${validationValue}".`
                    );
                }
                break;
        }
    }
}
