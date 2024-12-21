import { useMemo, useState } from 'react';
import { z, ZodSchema } from 'zod';

export interface IHandleChangeEvent {
  target: {
    name: string;
    value: string;
  };
}
export interface IHandleFocusEvent {
  target: {
    name: string;
  };
}

export default function useForm<
  Schema extends ZodSchema,
  Fields extends Keys<Schema>,
  FormElement extends BasicForm<Schema>,
  IFormValue extends z.infer<Schema>,
>(
  formElements: FormElement[] = [],
  schema: Schema,
  initialValues = {} as Partial<z.infer<Schema>>
) {
  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState({} as Record<string, string>);

  const setFiledValue = <
    Key extends Fields = Fields,
    Value extends IFormValue[Key] | undefined = IFormValue[Key] | undefined,
    Updater extends (curr?: Value) => Value = (curr?: Value) => Value,
  >(
    key: Key,
    value: Value | Updater
  ) => {
    setFormData((curr) => {
      if (typeof value === 'function') {
        return { ...curr, [key]: (value as Updater)(curr[key]) };
      }
      return { ...curr, [key]: value };
    });
  };

  const removeError = (key: string) => {
    setErrors(({ ...err }) => {
      delete err[key];
      return err;
    });
  };

  const setError = (key: string, value: string) => {
    setErrors((curr) => ({ ...curr, [key]: value }));
  };

  const handleChange = (event: IHandleChangeEvent) => {
    const { name, value } = event.target;
    setFormData((curr) => ({ ...curr, [name]: value }));
  };

  const handleFocus = (event: IHandleFocusEvent) => {
    const { name } = event.target;
    removeError(name);
  };

  const components = useMemo(() => {
    return formElements.map((item) => ({
      ...item,
      onChange: handleChange,
      onFocus: handleFocus,
      value: formData[item.name],
      error: errors[item.name.toString()],
    }));
  }, [formElements, formData, errors]);

  const validate = () => {
    const result = schema.safeParse(formData);
    if (result.success) {
      setErrors({});
      return {
        success: true as const,
        data: result.data as IFormValue,
      };
    }
    const errToSet: typeof errors = {};
    const err = result.error.formErrors.fieldErrors;
    for (const [key, value] of Object.entries(err)) {
      const currError = value?.[0];
      if (currError) errToSet[key] = currError;
    }
    setErrors(errToSet);
    return {
      errors: errToSet,
      success: false as const,
    };
  };

  const reset = () => {
    setFormData(initialValues);
    setErrors({});
  };

  return {
    validate,
    handleChange,
    handleFocus,
    components,
    values: formData,
    setFiledValue,
    errors,
    removeError,
    reset,
    setValues: setFormData,
    setError,
    setErrors,
  };
}

export type BasicForm<Schema extends ZodSchema> = Record<'name', Keys<Schema>>;

type Keys<schema extends ZodSchema> = keyof z.infer<schema>;