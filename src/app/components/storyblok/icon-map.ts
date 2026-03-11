/**
 * Icon Map: Storyblok text field value → Lucide React component
 *
 * In Storyblok, create a "Text" field (or single-option) with the icon name.
 * Mario can type e.g. "Heart", "Camera", "Film" and the correct Lucide icon renders.
 *
 * Only icons actually used across the site are included to keep the bundle small.
 * Add more as needed.
 */

import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Award,
  Baby,
  Cake,
  Calendar,
  CalendarCheck,
  Camera,
  CameraIcon,
  Check,
  Clock,
  Contrast,
  Download,
  FileText,
  Film,
  Gift,
  Heart,
  Leaf,
  Mail,
  MapPin,
  MessageCircle,
  Music,
  Palette,
  PartyPopper,
  Phone,
  Play,
  Smartphone,
  Sparkles,
  Star,
  Sun,
  Users,
  Video,
} from "lucide-react";

export type IconComponent = LucideIcon;

/**
 * Map of icon name strings → Lucide components.
 * Keys are PascalCase (matching Lucide export names).
 */
export const ICON_MAP: Record<string, LucideIcon> = {
  ArrowRight,
  Award,
  Baby,
  Cake,
  Calendar,
  CalendarCheck,
  Camera,
  CameraIcon,
  Check,
  Clock,
  Contrast,
  Download,
  FileText,
  Film,
  Gift,
  Heart,
  Leaf,
  Mail,
  MapPin,
  MessageCircle,
  Music,
  Palette,
  PartyPopper,
  Phone,
  Play,
  Smartphone,
  Sparkles,
  Star,
  Sun,
  Users,
  Video,
};

/**
 * Helper: Get all available icon names (for admin UI / dropdown)
 */
export function getAvailableIconNames(): string[] {
  return Object.keys(ICON_MAP).sort();
}
