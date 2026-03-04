import * as yup from "yup";

export const checkoutSchema = yup
  .object({
    fullName: yup
      .string()
      .required("Full name is required")
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be less than 100 characters")
      .matches(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces")
      .trim(),
    email: yup
      .string()
      .required("Email is required")
      .email("Please enter a valid email address")
      .trim(),
    phone: yup
      .string()
      .required("Phone number is required")
      .matches(/^[0-9+\-\s()]+$/, "Please enter a valid phone number")
      .min(10, "Phone number must be at least 10 digits")
      .max(20, "Phone number is too long")
      .trim(),
    address: yup
      .string()
      .required("Shipping address is required")
      .min(10, "Address must be at least 10 characters")
      .max(500, "Address must be less than 500 characters")
      .trim(),
    paymentMethod: yup
      .string()
      .required("Payment method is required")
      .oneOf(["Cash on Delivery", "Bank Transfer"], "Invalid payment method"),
    transactionReference: yup.string().when("paymentMethod", {
      is: (value: string) => value === "Bank Transfer",
      then: (schema) =>
        schema
          .required("Transaction reference is required for bank transfer")
          .min(5, "Transaction reference must be at least 5 characters")
          .max(100, "Transaction reference is too long")
          .trim(),
      otherwise: (schema) => schema.optional(),
    }),
  })
  .required();

export type CheckoutFormData = yup.InferType<typeof checkoutSchema>;
