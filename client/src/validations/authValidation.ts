import * as yup from "yup";

// Login validation schema
export const loginSchema = yup
  .object({
    email: yup
      .string()
      .required("Email is required")
      .email("Please enter a valid email address")
      .trim(),
    password: yup
      .string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters"),
  })
  .required();

export type LoginFormData = yup.InferType<typeof loginSchema>;

// Register validation schema
export const registerSchema = yup
  .object({
    name: yup
      .string()
      .required("Full name is required")
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be less than 50 characters")
      .trim(),
    email: yup
      .string()
      .required("Email is required")
      .email("Please enter a valid email address")
      .trim(),
    password: yup
      .string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters")
      .max(100, "Password must be less than 100 characters")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      ),
    confirmPassword: yup
      .string()
      .required("Please confirm your password")
      .oneOf([yup.ref("password")], "Passwords must match"),
  })
  .required();

export type RegisterFormData = yup.InferType<typeof registerSchema>;
