/**
 * Custom definition for Express.Request
 */
import { IMessage } from '../../constants';
import { User } from '../../entities/user.entity';
import * as models from '../../models';

declare global {
    namespace Express {
        // tslint:disable-next-line:interface-name
        interface Request {
            user: Partial<models.User> & {
                token?: {
                    accessToken: string;
                    refreshToken: string;
                };
                isAuthorized: boolean;
                getServiceOption(): {
                    endpoint: string;
                    accessToken?: string;
                    refreshToken?: string;
                    storeToken?(token: {
                        accessToken: string;
                        refreshToken: string;
                    }): void;
                };
                destroy(): void;
            };
            flash(message: string, value?: unknown): string[];
            consumeSession<X>(): { formData?: X; message?: IMessage };
        }
    }
}

declare module 'express-session' {
    interface SessionData {
        user: User | null;
        username: string | null;
        loggedin: boolean | null;
        authority: number | null;
        userId: number | null;
        searchQuery: Record<string, unknown> | null;
    }
}

export type CustomApiResult<Entity> = {
    message?: string | null;
    messages?: string[] | null;
    data?: Entity | Entity[] | null;
    status?: number;
};

export type CustomDataTableResult = {
    draw: number;
    recordsTotal: number;
    recordsFiltered: number;
    data: unknown[];
};

export type CustomValidateResult<Entity> = {
    isValid: boolean;
    message?: string;
    data?: Entity | null;
    datas?: Entity[] | null;
};

export type DestinationCallback = (error: Error | null, destination: string) => void;

export type FileNameCallback = (
    error: Error | string | string[] | null,
    filename: string,
) => void;
