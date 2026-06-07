import { Response } from 'express';

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}

export const sendSuccess = <T>(
    res: Response,
    data: T,
    message = 'Success',
    statusCode = 200
): Response => {
    const response: ApiResponse<T> = {
        success: true,
        message,
        data,
    };
    return res.status(statusCode).json(response);
};

export const sendError = (
    res: Response,
    message = 'Something went wrong',
    statusCode = 500,
    error?: string
): Response => {
    const response: ApiResponse<null> = {
        success: false,
        message,
        error,
    };
    return res.status(statusCode).json(response);
};