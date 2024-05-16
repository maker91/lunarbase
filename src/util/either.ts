export type Ok<TValue> = {
    ok: true,
    value: TValue
}

export type Fail<TError = unknown> = {
    ok: false,
    error: TError
}

export type Either<TValue, TError = unknown> = Ok<TValue> | Fail<TError>

export function ok<TValue>(val: TValue): Ok<TValue>;
export function ok(): Ok<void>;
export function ok(val?: any) {
    return {
        ok: true,
        value: val,
    };
}

export function fail<TError>(err: TError): Fail<TError> {
    return {
        ok: false,
        error: err,
    };
}