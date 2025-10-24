import { z } from 'zod';
import { FileFieldSchema } from '~/schema';
import FormValidator from './base';

export class FileFormValidator extends FormValidator<
    z.infer<typeof FileFieldSchema>
> {
    validate(data: any) {
        if (
            !data ||
            typeof data.name !== 'string' ||
            typeof data.size !== 'number' ||
            data.size < 0
        ) {
            throw new Error('Please upload a valid file.');
        }

        const allowed = this.schema.allowedFileTypes;
        const fileType = data.type || '';

        const valid = allowed.some((type) => {
            if (type === 'image') return fileType.startsWith('image/');
            if (type === 'pdf') return fileType === 'application/pdf';
            if (type === 'doc')
                return (
                    fileType.includes('msword') ||
                    fileType.includes('officedocument.wordprocessingml')
                );
            if (type === 'excel')
                return (
                    fileType.includes('excel') ||
                    fileType.includes('spreadsheetml')
                );
            if (type === 'csv') return fileType === 'text/csv';
            return false;
        });

        if (!valid) {
            const readableTypes = allowed
                .map((type) => {
                    switch (type) {
                        case 'image':
                            return 'image';
                        case 'pdf':
                            return 'PDF';
                        case 'doc':
                            return 'Word document';
                        case 'excel':
                            return 'Excel file';
                        case 'csv':
                            return 'CSV file';
                        default:
                            return type;
                    }
                })
                .join(', ');

            throw new Error(
                `This file type isn't supported. You can upload: ${readableTypes}.`
            );
        }

        const maxSizeMB = this.schema.maxSizeMB;
        if (maxSizeMB && data.size > maxSizeMB * 1024 * 1024) {
            throw new Error(
                `This file is too large. Maximum allowed size is ${maxSizeMB} MB.`
            );
        }
    }
}
