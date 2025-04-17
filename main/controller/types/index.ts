export type ErrorInterface = {
  success: false;
  error: true;
  message: string;
  stack: string | null;
};

export type SuccessInterface<T> = {
  success: true;
  error: false;
  message: string;
  stack: string | null;
  data: T;
};

export type HandleResponse<T> = SuccessInterface<T> | ErrorInterface;