import { useState } from "react";

export function useForm(initial = {}, validate = null) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: undefined }));
  };

  const handleBlur = (e) => {
    setTouched((p) => ({ ...p, [e.target.name]: true }));
    if (validate) setErrors(validate(values));
  };

  const setValue = (name, value) =>
    setValues((p) => ({ ...p, [name]: value }));

  const reset = () => {
    setValues(initial);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };

  const handleSubmit = (onSubmit) => async (e) => {
    e?.preventDefault();
    const allTouched = Object.keys(values).reduce(
      (a, k) => ({ ...a, [k]: true }), {}
    );
    setTouched(allTouched);
    if (validate) {
      const errs = validate(values);
      setErrors(errs);
      if (Object.keys(errs).length) return;
    }
    setIsSubmitting(true);
    try { await onSubmit(values); }
    finally { setIsSubmitting(false); }
  };

  return {
    values, errors, touched, isSubmitting,
    handleChange, handleBlur, handleSubmit, setValue, reset, setErrors,
  };
}
