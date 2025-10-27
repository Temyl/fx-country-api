import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";


export async function validateDto<T extends object>(
  dtoClass: new () => T,
  payload: any
) {
  const instance = plainToInstance(dtoClass, payload);
  const errors = await validate(instance);

  if (errors.length > 0) {
    const messages = errors.flatMap(err => Object.values(err.constraints || {}));
    return { valid: false, errors: messages };
  }

  return { valid: true, data: instance };
}
