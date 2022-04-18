export class ServiceResponse<T> {
  data: T | undefined;
  message: string | undefined;
  success: boolean = true;
  totalRecords?: number = undefined;
}
