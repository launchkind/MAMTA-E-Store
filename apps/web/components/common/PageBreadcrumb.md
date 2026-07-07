# PageBreadcrumb Component

A reusable breadcrumb navigation component with social sharing functionality.

## Features

- 🏠 Home icon navigation
- 📍 Customizable breadcrumb items
- 📱 Social media sharing (Facebook, Twitter, Instagram)
- 🔗 Copy link functionality
- 🎨 Clean white background with shadow
- 📱 Responsive design

## Usage

```tsx
import PageBreadcrumb from "@/components/common/PageBreadcrumb";

// Basic usage
<PageBreadcrumb
  items={[
    { label: "Category", href: "/category" },
    { label: "Subcategory" }
  ]}
  currentPage="Product Details"
/>

// With social sharing
<PageBreadcrumb
  items={[]}
  currentPage="Cart"
  showSocialShare={true}
  shareData={{
    title: "My Shopping Cart",
    text: "Check out my cart with 3 items from Babyshop",
    url: window.location.href,
  }}
/>
```

## Props

### `items` (required)

Array of breadcrumb items to display between Home and current page.

```tsx
interface BreadcrumbItem {
  label: string;
  href?: string; // Optional link
}
```

### `currentPage` (required)

String representing the current page name.

### `showSocialShare` (optional)

Boolean to show/hide social sharing icons. Default: `false`

### `shareData` (optional)

Object containing data for sharing:

```tsx
interface ShareData {
  title: string; // Page/product title
  text: string; // Description text
  url: string; // URL to share
}
```

## Examples

### Shop Page

```tsx
<PageBreadcrumb
  items={[]}
  currentPage="Shop"
  showSocialShare={true}
  shareData={{
    title: "Babyshop Products",
    text: "Discover amazing baby products at great prices",
    url: window.location.href,
  }}
/>
```

### Product Details Page

```tsx
<PageBreadcrumb
  items={[
    { label: "Shop", href: "/shop" },
    { label: "Baby Clothes", href: "/shop?category=clothes" },
  ]}
  currentPage="Cute Baby Dress"
  showSocialShare={true}
  shareData={{
    title: product.name,
    text: `Check out this amazing ${product.name} for only $${product.price}`,
    url: window.location.href,
  }}
/>
```

### Category Page

```tsx
<PageBreadcrumb
  items={[{ label: "Shop", href: "/shop" }]}
  currentPage="Baby Clothes"
  showSocialShare={true}
  shareData={{
    title: "Baby Clothes Collection",
    text: "Browse our amazing collection of baby clothes",
    url: window.location.href,
  }}
/>
```

### User Profile

```tsx
<PageBreadcrumb
  items={[{ label: "Account", href: "/user" }]}
  currentPage="Profile"
  // No social sharing for private pages
/>
```

## Social Media Platforms

- **Facebook**: Opens sharing dialog
- **Twitter**: Opens tweet composer
- **Instagram**: Copies text to clipboard (Instagram doesn't support direct URL sharing)
- **Copy Link**: Copies formatted text and URL to clipboard

## Styling

The component uses:

- White background (`bg-white`)
- Rounded corners (`rounded-2xl`)
- Subtle border and shadow
- Responsive padding
- Hover states for interactive elements

## Dependencies

- `lucide-react` for icons
- `sonner` for toast notifications
- `@/components/ui/button` for button styling
- `next/link` for navigation
