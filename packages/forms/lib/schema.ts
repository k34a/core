import z from 'zod/v4';

// ------------------------
// Safe Key for "name"
// ------------------------
export const safeName = z
    .string()
    .min(1, { message: 'Please enter a value.' })
    .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, {
        message:
            'This can only use letters, numbers, and underscores (no spaces or symbols).',
    });

// ------------------------
// Base Field Schema
// ------------------------
export const BaseFieldSchema = z.object({
    name: safeName,
    label: z.string().min(1, 'Please enter a question or label.'),
    required: z.boolean().default(false),
    helpText: z.string().optional(),
    placeholder: z.string().optional(),
});

// ------------------------
// Text Field
// ------------------------
export const TextFieldBaseSchema = BaseFieldSchema.extend({
    type: z.literal('text'),
    minLength: z.number().int().nonnegative().optional(),
    maxLength: z.number().int().positive().optional(),
});

export const TextFieldStaticValidation = TextFieldBaseSchema.extend({
    validationType: z.enum(['none', 'email', 'phone', 'url', 'pincode']),
});

export const TextFieldComparisionValidation = TextFieldBaseSchema.extend({
    validationType: z.enum(['equals', 'contains', 'startsWith', 'endsWith']),
    validationValue: z.string().min(1, 'Please enter a value to compare with.'),
});

export const TextFieldSchema = z.union([
    TextFieldStaticValidation,
    TextFieldComparisionValidation,
]);

// ------------------------
// Textarea Field
// ------------------------
export const TextAreaFieldSchema = BaseFieldSchema.extend({
    type: z.literal('textarea'),
    minLength: z.number().int().nonnegative().optional(),
    maxLength: z.number().int().positive().optional(),
});

// ------------------------
// Number Field
// ------------------------
export const NumberFieldSchema = BaseFieldSchema.extend({
    type: z.literal('number'),
    min: z.number().optional(),
    max: z.number().optional(),
    step: z.number().optional(),
});

// ------------------------
// Checkbox / Toggle
// ------------------------
export const CheckboxFieldSchema = BaseFieldSchema.extend({
    type: z.literal('checkbox'),
    defaultChecked: z.boolean().default(false),
    uiType: z.enum(['checkbox', 'toggle']).default('checkbox'),
});

// ------------------------
// Date Field
// ------------------------
export const MinMaxDateSchema = z.union([
    z.literal('none'),
    z.literal('today'),
    z.literal('yesterday'),
    z.literal('tomorrow'),
    z.string().refine((val) => !isNaN(Date.parse(val)), {
        message:
            "Please enter a valid date like '2025-09-11' or select from today, yesterday, or tomorrow.",
    }),
]);

export const DateFieldSchema = BaseFieldSchema.extend({
    type: z.literal('date'),
    minDate: MinMaxDateSchema,
    maxDate: MinMaxDateSchema,
});

// ------------------------
// Date Range
// ------------------------
export const DateRangeFieldSchema = BaseFieldSchema.extend({
    type: z.literal('dateRange'),
    minDate: MinMaxDateSchema,
    maxDate: MinMaxDateSchema,
    gapInDays: z
        .object({
            min: z.number().optional(),
            max: z.number().optional(),
        })
        .optional(),
});

// ------------------------
// File Field
// ------------------------
export const AllowedFileTypes = z.enum(['image', 'pdf', 'doc', 'excel', 'csv']);

export const FileFieldSchema = BaseFieldSchema.extend({
    type: z.literal('file'),
    allowedFileTypes: z.array(AllowedFileTypes),
    maxSizeMB: z.number().default(5),
});

// ------------------------
// Select Field
// ------------------------
export const SelectFieldSchema = BaseFieldSchema.extend({
    type: z.literal('select'),
    options: z.array(z.string()).refine(
        (options) => {
            const uniqueOptions = new Set(options);
            return uniqueOptions.size === options.length;
        },
        {
            message: 'All dropdown options must be different from each other.',
        }
    ),
    multiple: z.boolean().default(false),
});

// ------------------------
// Post Submit Configuration
// ------------------------
export const PostSubmitConfigSchema = z.object({
    title: z.string().min(1, {
        message:
            'Please enter a thank-you title or short heading that users will see after submitting the form.',
    }),
    text: z.string().min(1, {
        message:
            'Please write a short message that users will see after submitting the form. This could be a thank-you note or next steps.',
    }),
    allowResubmit: z.boolean().default(false),
});

// ------------------------
// Final Form Schema
// ------------------------
export const FormSchema = z
    .object({
        title: z.string().min(1, 'The form title is required.'),
        description: z.string().optional(),
        submitButtonLabel: z.string().default('Submit'),
        afterSubmitConfig: PostSubmitConfigSchema,

        fields: z
            .array(
                z.union([
                    TextFieldSchema,
                    TextAreaFieldSchema,
                    NumberFieldSchema,
                    CheckboxFieldSchema,
                    DateFieldSchema,
                    DateRangeFieldSchema,
                    FileFieldSchema,
                    SelectFieldSchema,
                ])
            )
            .min(1, 'Please add atleast 1 question/field in your form.'),

        order: z
            .array(z.string())
            .min(1)
            .refine((val) => new Set(val).size === val.length, {
                message:
                    'Order must have unique field names, found duplicate fields.',
            }),
    })
    .superRefine((schema, ctx) => {
        const fieldNames = new Set(schema.fields.map((f) => f.name));
        const orderNames = new Set(schema.order);

        const missing = [...fieldNames].filter((name) => !orderNames.has(name));
        const extra = [...orderNames].filter((name) => !fieldNames.has(name));

        if (missing.length > 0) {
            ctx.addIssue({
                code: 'custom',
                message: `Some fields are missing in the order: ${missing.join(
                    ', '
                )}. Please add them to the field order.`,
                path: ['order'],
            });
        }

        if (extra.length > 0) {
            ctx.addIssue({
                code: 'custom',
                message: `These fields don't exist: ${extra.join(
                    ', '
                )}. Please remove them from the field order.`,
                path: ['order'],
            });
        }
    });
