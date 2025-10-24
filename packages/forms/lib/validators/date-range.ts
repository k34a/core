import { z } from 'zod';
import { DateRangeFieldSchema } from '~/schema';
import FormValidator from './base';

export class DateRangeFormValidator extends FormValidator<
    z.infer<typeof DateRangeFieldSchema>
> {
    validate(data: any) {
        if (!Array.isArray(data) || data.length !== 2) {
            throw new Error('Please select a valid start and end date.');
        }

        const [start, end] = data;

        if (typeof start !== 'string' || typeof end !== 'string') {
            throw new Error('Please select valid dates.');
        }

        if (start > end) {
            throw new Error('The start date cannot be after the end date.');
        }

        const gap = this.schema.gapInDays;
        const diffDays =
            (new Date(end).getTime() - new Date(start).getTime()) /
            (1000 * 60 * 60 * 24);

        if (gap?.min && diffDays < gap.min) {
            throw new Error(
                `Please select a range of at least ${gap.min} day${
                    gap.min === 1 ? '' : 's'
                }.`
            );
        }

        if (gap?.max && diffDays > gap.max) {
            throw new Error(
                `The selected range is too long. Please choose up to ${
                    gap.max
                } day${gap.max === 1 ? '' : 's'}.`
            );
        }
    }
}
