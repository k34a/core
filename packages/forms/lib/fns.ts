import { notifications } from '@mantine/notifications';

export const parseNumber = (val: number | string) => {
    if (typeof val === 'number') {
        return val;
    }

    const parsedInt = parseInt(val);
    if (!isNaN(parsedInt)) {
        return parsedInt;
    }

    return undefined;
};

export function formatErrors(errors?: string[]) {
    if (!errors) {
        return '';
    }
    return errors.join('\n');
}

export function deepEqual(obj1: any, obj2: any) {
    if (obj1 === obj2) {
        return true;
    }

    if (
        obj1 == null ||
        typeof obj1 !== 'object' ||
        obj2 == null ||
        typeof obj2 !== 'object'
    ) {
        return false;
    }

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
        return false;
    }

    for (const key of keys1) {
        if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
            return false;
        }
    }

    return true;
}

import z from 'zod';
import { DateFieldSchema } from './schema';

export const dateOptionsMin = [
    { value: 'none', label: 'None', preset: true },
    {
        value: 'yesterday',
        label: 'Yesterday (Users should select yesterday, today, or a future date)',
        preset: true,
    },
    {
        value: 'today',
        label: 'Today (Users should select today or a future date)',
        preset: true,
    },
    {
        value: 'tomorrow',
        label: 'Tomorrow (Users should select tomorrow or a future date)',
        preset: true,
    },
    {
        value: 'custom',
        label: 'Custom (Pick your own date)',
    },
];

export const dateOptionsMax = [
    { value: 'none', label: 'None', preset: true },
    {
        value: 'yesterday',
        label: 'Yesterday (Users can select up to the day before today, not in the future)',
        preset: true,
    },
    {
        value: 'today',
        label: 'Today (Users can select up to today, not in the future)',
        preset: true,
    },
    {
        value: 'tomorrow',
        label: 'Tomorrow (Users can select up to tomorrow, not in the future)',
        preset: true,
    },
    {
        value: 'custom',
        label: 'Custom (Pick your own date)',
    },
];

export const validateGapDifferences = (
    gap: number,
    updatedMinGap: number | undefined,
    updatedMaxGap: number | undefined
) => {
    if (updatedMinGap !== undefined && gap < updatedMinGap) {
        notifications.show({
            title: `Gap is too small (min: ${updatedMinGap} days)`,
            message: `Please reduce the minimum gap or widen your date range.`,
            color: 'red',
        });
    }

    if (updatedMaxGap !== undefined && gap > updatedMaxGap) {
        notifications.show({
            title: `Gap is too large (max: ${updatedMaxGap} days)`,
            message: `Please increase the maximum gap or narrow your date range.`,
            color: 'red',
        });
    }
};

export const calculateGap = (start: string, end: string): number => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.floor(
        (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)
    );
};

export function resolveDateLimit(
    limit: z.infer<typeof DateFieldSchema>['minDate']
) {
    if (!limit || limit === 'none') {
        return undefined;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    switch (limit) {
        case 'today':
            return today;
        case 'yesterday':
            const y = new Date(today);
            y.setDate(y.getDate() - 1);
            return y;
        case 'tomorrow':
            const t = new Date(today);
            t.setDate(t.getDate() + 1);
            return t;
        default:
            const parsed = new Date(limit);
            return isNaN(parsed.getTime()) ? undefined : parsed;
    }
}

function isValidDateFormat(str: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(str);
}

export const validateMinMaxDates = (
    minDate: string | undefined,
    maxDate: string | undefined
) => {
    if (!minDate || !maxDate || minDate <= maxDate) {
        return;
    }

    if (!isValidDateFormat(minDate) || !isValidDateFormat(maxDate)) {
        return;
    }

    notifications.show({
        title: 'Date Range Issue',
        message: `The maximum date (${maxDate}) is before the minimum one (${minDate}). Please fix the date range so users can select a valid date.`,
        color: 'red',
    });
};
