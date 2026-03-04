import * as yup from "yup";

export const productSchema = yup
  .object({
    name: yup
      .string()
      .required("Product name is required")
      .min(3, "Product name must be at least 3 characters")
      .max(100, "Product name must be less than 100 characters")
      .trim(),
    description: yup
      .string()
      .required("Product description is required")
      .min(10, "Description must be at least 10 characters")
      .max(1000, "Description must be less than 1000 characters")
      .trim(),
    price: yup
      .number()
      .required("Price is required")
      .positive("Price must be a positive number")
      .typeError("Price must be a number"),
    stock: yup
      .number()
      .required("Stock quantity is required")
      .integer("Stock must be an integer")
      .min(0, "Stock cannot be negative")
      .typeError("Stock must be a number"),
    category: yup.string().required("Category is required").trim(),
    image: yup
      .string()
      .required("Product image is required")
      .test("isValidImage", "Please upload a valid image", (value) => {
        if (!value) return false;
        // Allow data URLs (from file uploads)
        if (value.startsWith("data:image/")) return true;
        // Allow regular URLs
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      })
      .test(
        "fileSize",
        "Image size should be less than 5MB",
        (value) => !value || value.length < 5 * 1024 * 1024,
      ),
  })
  .required();

export type ProductFormData = yup.InferType<typeof productSchema>;
