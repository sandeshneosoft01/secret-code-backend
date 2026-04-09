import { Request } from 'express';
import { LanguageDictionary } from '../types';
import { isEmpty, isPlainObject } from 'lodash';

// Example global language object
declare const language: LanguageDictionary;

export const getMessage = (req: Request, data: any, key: string): string => {
  let message = '';
  // // headers are string | string[] | undefined
  // const langHeader = req.headers['language'];
  // const languageCode = (Array.isArray(langHeader) ? langHeader[0] : langHeader) || 'en';

  // const langSet = language[languageCode];

  // if (langSet && langSet[key]) {
  //   const value = langSet[key];
  //   if (typeof value === 'function') {
  //     message = value(data);
  //   } else {
  //     message = value;
  //   }
  // } else {
  //   message = key;
  // }

  return message;
};

export const customError = (
  req: any, // replace `any` with your request type if available
  message: string,
  errorCode: number,
): Error & { errorCode: number } => {
  return Object.assign(new Error(getMessage(req, false, message)), {
    errorCode,
  });
};

export const jsonToString = (obj: any = {}) => {
  try {
    if (isPlainObject(obj) && !isEmpty(obj)) {
      return JSON.stringify(obj);
    }
    return isEmpty(obj) ? String(obj) : obj;
  } catch (error: any) {
    throw new Error(error);
  }
};

export const generateId = () => {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
};

export const formatDuration = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
};

export const getLastNDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

export const percentChange = (current: number, previous: number) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(2));
};
