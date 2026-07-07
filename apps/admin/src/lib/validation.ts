import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  role: z.string().min(1, {
    message: "Please select a valid role",
  }),
});

export const userSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" })
      .optional(),
    role: z.string().min(1, {
      message: "Please select a valid role",
    }),
    employee_role: z
      .enum(["packer", "deliveryman", "accounts", "incharge", "call_center"], {
        message: "Please select a valid employee role",
      })
      .optional()
      .nullable(),
    avatar: z.string().optional(),
  })
  .refine(
    (data) => {
      // If role is employee, employee_role must be provided
      if (data.role === "employee") {
        return data.employee_role != null && data.employee_role !== undefined;
      }
      return true;
    },
    {
      message: "Employee role is required when role is set to employee",
      path: ["employee_role"],
    },
  );

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  image: z.string().optional(),
  iconImage: z.string().optional(),
  categoryType: z
    .array(z.enum(["Featured", "Hot Categories", "Top Categories"]))
    .optional()
    .default([]),
  parent: z.string().optional().nullable(),
  order: z.number().optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const brandSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  image: z.string().optional(),
});

export const productTypeSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  type: z.string().min(2, { message: "Type must be at least 2 characters" }),
  description: z.string().optional(),
  bannerImages: z.array(z.string()).optional(),
  icon: z.string().optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.number().optional(),
  color: z.string().optional(),
});

export const productSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  slug: z.string().optional(),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" }),
  aboutItems: z.array(z.string()).optional(),
  price: z.number().min(0, { message: "Price must be a positive number" }),
  discountPercentage: z.number().min(0).max(100),
  stock: z.number().min(0),
  category: z.string().min(1, { message: "Please select a category" }),
  brand: z.string().min(1, { message: "Please select a brand" }),
  images: z
    .array(z.string())
    .min(1, { message: "Please upload at least one image" })
    .max(
      parseInt(import.meta.env.VITE_MAX_PRODUCT_IMAGES) || 5,
      `Maximum ${parseInt(import.meta.env.VITE_MAX_PRODUCT_IMAGES) || 5} images allowed`,
    ),
  image: z.string().optional(), // Deprecated: kept for backward compatibility
  productType: z.array(z.string()),
});

export const ratingSchema = z.object({
  rating: z.number().min(1).max(5),
});

export const productBannerSchema = z
  .object({
    title: z
      .string()
      .min(2, { message: "Title must be at least 2 characters" }),
    description: z.string().optional(),
    image: z.string().min(1, { message: "Image is required" }),
    buttonTitle: z.string().optional(),
    buttonHref: z.string().optional(),
    isActive: z.boolean(),
    order: z.number(),
    productType: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.buttonTitle && !data.buttonHref) {
        return false;
      }
      return true;
    },
    {
      message: "Button Href is required when Button Title is provided",
      path: ["buttonHref"],
    },
  );
