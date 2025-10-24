export default abstract class FormValidator<T> {
    protected schema: T;

    constructor(schema: T) {
        this.schema = schema;
    }

    abstract validate(data: any): void;
}
