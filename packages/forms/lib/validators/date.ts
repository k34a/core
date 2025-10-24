import { z } from 'zod';
import { DateFieldSchema } from '~/schema';
import FormValidator from './base';
import { resolveDateLimit } from '~/fns';

export class DateFormValidator extends FormValidator<
    z.infer<typeof DateFieldSchema>
> {
    validate(data: any) {
        if (typeof data !== 'string' || isNaN(new Date(data).getTime())) {
            throw new Error('Please pick a valid date.');
        }

        const resolvedData = new Date(data);
        resolvedData.setHours(0, 0, 0, 0);

        const min = resolveDateLimit(this.schema.minDate);
        if (min && resolvedData < min) {
            throw new Error(
                `The selected date is too early. Please choose a date on or after ${min.toDateString()}.`
            );
        }

        const max = resolveDateLimit(this.schema.maxDate);
        if (max && resolvedData > max) {
            throw new Error(
                `The selected date is too late. Please choose a date on or before ${max.toDateString()}.`
            );
        }
    }
}
