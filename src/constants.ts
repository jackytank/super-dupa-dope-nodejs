export const labels = {
    FIRST: 'First',
    LAST: 'Last',
    NEXT: 'Next',
    PREVIOUS: 'Previous',
};

export const messageTypes = {
    error: 'error',
    info: 'info',
    success: 'success',
};

export const titleMessageError = {
    NOT_FOUND: 'TITLE NOT FOUND',
    INTERNAL_SERVER_ERROR: 'Internal Server Error',
    FORBIDDEN: 'Forbidden, access denied.',
};

export interface IMessage {
    // tslint:disable-next-line:no-reserved-keywords
    type: string;
    content: string;
}

export const valueLst = {
    // disable flag
    disableFlgs: {
        0: 'Valid',
        1: 'Invalid',
    },
};

export const messages = {
    CSVDefault: 'Please note that an error will occur if there is unnecessary data or rewriting of item names in the header of the format.',
    ECL001: (column: string) => `${column} is a required item.`,
    FORBIDDEN: `Forbidden, access denied.`,
    INTERNAL_SERVER_ERROR: `I'm sorry. <br/> The page you were trying to access could not be found. <br/>
    The URL may have changed due to site updates, or the URL may not have been entered correctly. <br/>
    If this page is still displayed after reloading the browser, please contact your system administrator.`,
    ECL034: (param: string) => `An invalid value has been entered or selected for ${param}.`,
    API_SELECT_ERROR: (code: string) => `Corresponding information does not exist. (API response: <${code}>)`,
    API_UPDATE_ERROR: (code: string) => `A server error has occurred. Please check the data and register again. (API response: <${code}>)`,
    ECL054: 'Failed to call the CSV creation process.',
    NOT_FOUND: 'NOT FOUND',
    BAD_REQUEST: 'BAD REQUEST',
    ECL056: 'No data in session.',
    ECL057: 'Failed to register data.',
};

// tri - my own custom constants - START
export const errMsg = {
    ERR001: (column: string) => {
        return `${column.toUpperCase()} is required!`;
    },
    ERR002: (column: string, minLength: number, maxLength: number) => {
        return `${column.toUpperCase()} should be more than ${minLength}, less than equal to ${maxLength} characters`;
    },
    ERR003: (email: string) => {
        return `${email.toUpperCase()} is invalid!`;
    },
    ERR004: (field1: string, field2: string) => {
        return `${field1.toUpperCase()} must match ${field2}`;
    },
    ERR005: (field: string, min: number) => {
        return `${field.toUpperCase()} should be bigger than ${min} characters`;
    },
    ERR006: (field: string, max: number) => {
        return `${field.toUpperCase()} should be less than equal to ${max} characters`;
    },
    ERR007: (field: string, type: string) => {
        return `${field.toUpperCase()} is not of type ${type.toLowerCase()}`;
    },
};

export const _1MB = 1024 * 1024;

export const _1GB = _1MB * 1024;

export const _1TB = _1GB * 1024;

export const _MB = (multiply: number) => {
    return _1MB * multiply;
};

export const ROLE = {
    USER: 1,
    ADMIN: 2,
    MANAGER: 3,
};

export const ROLES = Object.values(ROLE);
// tri - my own custom constants - END
