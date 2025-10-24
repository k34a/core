import { createClient } from '@supabase/supabase-js';
import z from 'zod';
import type { FormSchema } from '~/schema';
import { getValidator } from '~/validators';

interface FormSubmissionSuccess {
    valid: true;
    presignedUrls: Record<string, string>;
}

interface FormSubmissionFailure {
    valid: false;
    errors: Record<string, string[]>;
}

export default class FormFillingService {
    private supaClient;

    constructor(projectUrl: string, secretKey: string) {
        this.supaClient = createClient(projectUrl, secretKey);
    }

    /** Get the form schema for a given type */
    public async getFormSchema(
        formType: string
    ): Promise<z.infer<typeof FormSchema>> {
        const { data, error } = await this.supaClient
            .from('forms')
            .select('schema')
            .eq('form_type', formType)
            .maybeSingle();

        if (error) throw new Error(error.message);
        if (!data) throw new Error('Form not found');

        return data.schema;
    }

    /** Validate user-submitted data against schema */
    private validateData(
        schema: z.infer<typeof FormSchema>,
        data: Record<string, any>
    ) {
        if (!schema?.fields || !Array.isArray(schema.fields)) {
            throw new Error('Invalid form schema retrieved.');
        }

        const errors: Record<string, Array<string>> = {};

        for (const field of schema.fields) {
            const validator = getValidator(field);
            const userValue = data[field.name];

            if (
                field.required &&
                (userValue === undefined ||
                    userValue === null ||
                    userValue === '')
            ) {
                errors[field.name] = ['This field is required.'];
                continue;
            }

            try {
                if (
                    userValue !== undefined &&
                    userValue !== null &&
                    userValue !== ''
                ) {
                    validator.validate(userValue);
                }
            } catch (err: any) {
                errors[field.name] = [err.message || 'Invalid input.'];
            }
        }

        return {
            valid: Object.keys(errors).length === 0,
            errors,
        };
    }

    /** Save the submitted form data */
    private async saveFormData(
        formType: string,
        formData: Record<string, any>
    ): Promise<{ id: string }> {
        const { data, error } = await this.supaClient
            .from('form_submissions')
            .insert([
                {
                    form_type: formType,
                    form_data: formData,
                },
            ])
            .select('id')
            .single();

        if (error) {
            console.error({ message: error.message });
            throw new Error('Unable to submit form.');
        }

        return { id: data.id };
    }

    /** Generate presigned upload URLs for any file-type fields */
    private async generatePresignedUploadUrls(
        submissionId: string,
        schema: z.infer<typeof FormSchema>,
        data: Record<string, any>
    ): Promise<Record<string, string>> {
        const urls: Record<string, string> = {};
        const fileFields = schema.fields.filter((f) => f.type === 'file');

        for (const field of fileFields) {
            const file = data[field.name];
            if (!file || typeof file.name !== 'string') continue;

            const path = `form-submissions/${submissionId}/${field.name}/${file.name}`;

            const { data: signedUrlData, error } = await this.supaClient.storage
                .from('user-uploads')
                .createSignedUploadUrl(path);

            if (error || !signedUrlData?.signedUrl) {
                console.warn(
                    `Could not generate presigned URL for ${field.name}`,
                    error
                );
                continue;
            }

            urls[field.name] = signedUrlData.signedUrl;
        }

        return urls;
    }

    /** Public method to fill/submit form */
    public async fillForm(
        formType: string,
        data: Record<string, any>
    ): Promise<FormSubmissionSuccess | FormSubmissionFailure> {
        try {
            const schema = await this.getFormSchema(formType);

            const validationResult = this.validateData(schema, data);
            if (!validationResult.valid) {
                return validationResult as FormSubmissionFailure;
            }

            const { id: submissionId } = await this.saveFormData(
                formType,
                data
            );
            const presignedUrls = await this.generatePresignedUploadUrls(
                submissionId,
                schema,
                data
            );

            return { valid: true, presignedUrls };
        } catch (err: any) {
            return {
                valid: false,
                errors: {
                    _form: [err.message || 'Failed to submit form.'],
                },
            };
        }
    }
}
