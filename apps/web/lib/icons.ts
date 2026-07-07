/**
 * Type-safe Lucide icons for React 19 compatibility
 *
 * This file exports all commonly used Lucide icons with proper type assertions
 * to prevent TypeScript errors when using React 19 with lucide-react.
 *
 * Usage:
 * import { UserIcon, MailIcon } from "@/lib/icons";
 * <UserIcon className="h-4 w-4" />
 */

import * as LucideIcons from "lucide-react";
import React from "react";

// Type helper for icon components
type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;

// Export type-safe icon components
export const UserIcon = LucideIcons.User as IconComponent;
export const MailIcon = LucideIcons.Mail as IconComponent;
export const ShieldIcon = LucideIcons.Shield as IconComponent;
export const LogOutIcon = LucideIcons.LogOut as IconComponent;
export const SaveIcon = LucideIcons.Save as IconComponent;
export const EyeIcon = LucideIcons.Eye as IconComponent;
export const EyeOffIcon = LucideIcons.EyeOff as IconComponent;
export const MapPinIcon = LucideIcons.MapPin as IconComponent;
export const PlusIcon = LucideIcons.Plus as IconComponent;
export const Edit2Icon = LucideIcons.Edit2 as IconComponent;
export const Trash2Icon = LucideIcons.Trash2 as IconComponent;
export const ShoppingCartIcon = LucideIcons.ShoppingCart as IconComponent;
export const PackageIcon = LucideIcons.Package as IconComponent;
export const ChevronRightIcon = LucideIcons.ChevronRight as IconComponent;
export const Loader2Icon = LucideIcons.Loader2 as IconComponent;
export const XIcon = LucideIcons.X as IconComponent;
export const CheckIcon = LucideIcons.Check as IconComponent;
export const SearchIcon = LucideIcons.Search as IconComponent;
export const HeartIcon = LucideIcons.Heart as IconComponent;
export const StarIcon = LucideIcons.Star as IconComponent;
export const MenuIcon = LucideIcons.Menu as IconComponent;
export const ChevronDownIcon = LucideIcons.ChevronDown as IconComponent;
export const ChevronUpIcon = LucideIcons.ChevronUp as IconComponent;
export const ChevronLeftIcon = LucideIcons.ChevronLeft as IconComponent;
export const FilterIcon = LucideIcons.Filter as IconComponent;
export const SortAscIcon = LucideIcons.SortAsc as IconComponent;
export const SortDescIcon = LucideIcons.SortDesc as IconComponent;
export const InfoIcon = LucideIcons.Info as IconComponent;
export const AlertCircleIcon = LucideIcons.AlertCircle as IconComponent;
export const CheckCircleIcon = LucideIcons.CheckCircle as IconComponent;
export const XCircleIcon = LucideIcons.XCircle as IconComponent;
export const SettingsIcon = LucideIcons.Settings as IconComponent;
export const BellIcon = LucideIcons.Bell as IconComponent;
export const HomeIcon = LucideIcons.Home as IconComponent;
export const CreditCardIcon = LucideIcons.CreditCard as IconComponent;
export const TruckIcon = LucideIcons.Truck as IconComponent;
export const CalendarIcon = LucideIcons.Calendar as IconComponent;
export const ClockIcon = LucideIcons.Clock as IconComponent;
export const ImageIcon = LucideIcons.Image as IconComponent;
export const UploadIcon = LucideIcons.Upload as IconComponent;
export const DownloadIcon = LucideIcons.Download as IconComponent;
export const ExternalLinkIcon = LucideIcons.ExternalLink as IconComponent;
export const CopyIcon = LucideIcons.Copy as IconComponent;
export const FileIcon = LucideIcons.File as IconComponent;
export const FolderIcon = LucideIcons.Folder as IconComponent;
export const GridIcon = LucideIcons.Grid as IconComponent;
export const ListIcon = LucideIcons.List as IconComponent;
export const MoreVerticalIcon = LucideIcons.MoreVertical as IconComponent;
export const MoreHorizontalIcon = LucideIcons.MoreHorizontal as IconComponent;
export const RefreshCwIcon = LucideIcons.RefreshCw as IconComponent;
export const ShareIcon = LucideIcons.Share as IconComponent;
export const Share2Icon = LucideIcons.Share2 as IconComponent;
export const ZoomInIcon = LucideIcons.ZoomIn as IconComponent;
export const ZoomOutIcon = LucideIcons.ZoomOut as IconComponent;

// Add more icons as needed...
