// types/errors.ts
export type CrudError =
    | PrismaKnownRequestError
    | PrismaValidationError
    | GenericError;

interface PrismaKnownRequestError {
    kind: 'prisma-known';
    code: string;
    meta?: {
        target?: string[];
    };
}

interface PrismaValidationError {
    kind: 'prisma-validation';
    message: string;
}

interface GenericError {
    kind: 'generic';
    message: string;
}