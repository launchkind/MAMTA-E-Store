// Role-based menu visibility configuration

type MenuItem = {
  path: string;
  allowedRoles: string[];
  allowedEmployeeRoles?: string[];
};

const menuPermissions: MenuItem[] = [
  {
    path: "/dashboard",
    allowedRoles: ["admin", "employee"],
    allowedEmployeeRoles: [
      "call_center",
      "packer",
      "deliveryman",
      "accounts",
      "incharge",
    ],
  },
  {
    path: "/dashboard/account",
    allowedRoles: ["admin", "employee"],
    allowedEmployeeRoles: ["accounts", "incharge"],
  },
  {
    path: "/dashboard/users",
    allowedRoles: ["admin"],
  },
  {
    path: "/dashboard/customers",
    allowedRoles: ["admin"],
  },
  {
    path: "/dashboard/addresses",
    allowedRoles: ["admin"],
  },
  {
    path: "/dashboard/employees",
    allowedRoles: ["admin"],
  },
  {
    path: "/dashboard/salaries",
    allowedRoles: ["admin"],
  },
  {
    path: "/dashboard/orders",
    allowedRoles: ["admin", "employee"],
    allowedEmployeeRoles: [
      "call_center",
      "packer",
      "deliveryman",
      "accounts",
      "incharge",
    ],
  },
  {
    path: "/dashboard/invoices",
    allowedRoles: ["admin"],
  },
  {
    path: "/dashboard/notifications",
    allowedRoles: ["admin"],
  },
  {
    path: "/dashboard/banners",
    allowedRoles: ["admin"],
  },
  {
    path: "/dashboard/product-banners",
    allowedRoles: ["admin"],
  },
  {
    path: "/dashboard/ads-banners",
    allowedRoles: ["admin"],
  },
  {
    path: "/dashboard/products",
    allowedRoles: ["admin", "employee"],
    allowedEmployeeRoles: ["packer", "incharge"],
  },
  {
    path: "/dashboard/product-types",
    allowedRoles: ["admin", "employee"],
    allowedEmployeeRoles: ["packer", "incharge"],
  },
  {
    path: "/dashboard/categories",
    allowedRoles: ["admin"],
  },
  {
    path: "/dashboard/brands",
    allowedRoles: ["admin"],
  },
  {
    path: "/dashboard/reviews",
    allowedRoles: ["admin"],
  },
  {
    path: "/dashboard/contact",
    allowedRoles: ["admin"],
  },
  {
    path: "/dashboard/social-media",
    allowedRoles: ["admin"],
  },
  {
    path: "/dashboard/website-config",
    allowedRoles: ["admin"],
  },
  {
    path: "/dashboard/website-icons",
    allowedRoles: ["admin"],
  },
  {
    path: "/dashboard/component-types",
    allowedRoles: ["admin"],
  },
  {
    path: "/dashboard/purchases",
    allowedRoles: ["admin"],
  },
  {
    path: "/dashboard/purchases/create",
    allowedRoles: ["admin"],
  },
  {
    path: "/dashboard/purchases/approved",
    allowedRoles: ["admin"],
  },
  {
    path: "/dashboard/purchases/purchased",
    allowedRoles: ["admin"],
  },
  {
    path: "/dashboard/purchases/suppliers",
    allowedRoles: ["admin"],
  },
  {
    path: "/dashboard/sellers",
    allowedRoles: ["admin"],
  },
  {
    path: "/dashboard/seller-products",
    allowedRoles: ["admin"],
  },
  {
    path: "/dashboard/seller-config",
    allowedRoles: ["admin"],
  },
  {
    path: "/dashboard/base-config",
    allowedRoles: ["admin"],
  },
];

export const canAccessMenuItem = (
  menuPath: string,
  userRole: string,
  employeeRole?: string | null,
): boolean => {
  const menuItem = menuPermissions.find((item) => item.path === menuPath);

  if (!menuItem) {
    return false; // If menu item not found, deny access
  }

  // Check if user's main role is allowed
  if (!menuItem.allowedRoles.includes(userRole)) {
    return false;
  }

  // If user is an employee, check if their employee role is allowed
  if (userRole === "employee") {
    if (!menuItem.allowedEmployeeRoles) {
      return false; // Employee roles not defined for this menu
    }

    if (!employeeRole) {
      return false; // Employee must have an employee_role
    }

    return menuItem.allowedEmployeeRoles.includes(employeeRole);
  }

  return true;
};

const ORDER_STATUSES = [
  "pending",
  "address_confirmed",
  "confirmed",
  "packed",
  "delivering",
  "delivered",
  "completed",
  "cancelled",
];

// Helper to get status badge color and name based on user role value (system key)
export const getOrderStatusForRole = (
  userRoleValue: string,
  employeeRoleValue?: string | null,
): {
  availableStatuses: string[];
  highlightStatuses: string[];
} => {
  // Admin has full access to all statuses
  if (userRoleValue === "admin") {
    return {
      availableStatuses: ORDER_STATUSES,
      highlightStatuses: ["pending", "address_confirmed"],
    };
  }

  if (userRoleValue === "employee") {
    switch (employeeRoleValue) {
      case "call_center":
        return {
          availableStatuses: ["pending", "address_confirmed", "confirmed"],
          highlightStatuses: ["pending"],
        };
      case "packer":
        return {
          availableStatuses: ["address_confirmed", "confirmed", "packed"],
          highlightStatuses: ["address_confirmed", "confirmed"],
        };
      case "deliveryman":
        return {
          availableStatuses: ["packed", "delivering", "delivered"],
          highlightStatuses: ["packed", "delivering"],
        };
      case "accounts":
        return {
          availableStatuses: ["delivered", "completed"],
          highlightStatuses: ["delivered"],
        };
      case "incharge":
        return {
          availableStatuses: ORDER_STATUSES,
          highlightStatuses: [
            "pending",
            "address_confirmed",
            "confirmed",
            "packed",
          ],
        };
      default:
        return {
          availableStatuses: [],
          highlightStatuses: [],
        };
    }
  }

  return {
    availableStatuses: [],
    highlightStatuses: [],
  };
};

// Get friendly status name
export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: "Pending",
    address_confirmed: "Address Confirmed",
    confirmed: "Confirmed",
    packed: "Packed",
    delivering: "Delivering",
    delivered: "Delivered",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return labels[status] || status;
};

// Get role-specific dashboard greeting
export const getRoleDashboardMessage = (
  userRole: string,
  employeeRole?: string | null,
): { title: string; description: string } => {
  if (userRole === "admin") {
    return {
      title: "Admin Dashboard",
      description: "Manage all aspects of your e-commerce platform",
    };
  }

  if (userRole === "employee") {
    switch (employeeRole) {
      case "call_center":
        return {
          title: "Call Center Dashboard",
          description:
            "Confirm customer addresses and prepare orders for packing",
        };
      case "packer":
        return {
          title: "Packer Dashboard",
          description: "Pack confirmed orders and prepare them for delivery",
        };
      case "deliveryman":
        return {
          title: "Deliveryman Dashboard",
          description: "Manage deliveries and collect COD payments",
        };
      case "accounts":
        return {
          title: "Accounts Dashboard",
          description: "Complete orders and manage financial records",
        };
      case "incharge":
        return {
          title: "Incharge Dashboard",
          description: "Oversee operations and manage the team",
        };
      default:
        return {
          title: "Employee Dashboard",
          description: "Welcome to your dashboard",
        };
    }
  }

  return {
    title: "Dashboard",
    description: "Welcome to your dashboard",
  };
};
