export type LanguageDictionary = {
  [key: string]: {
    [msgKey: string]: string | ((data: any) => string);
  };
};
