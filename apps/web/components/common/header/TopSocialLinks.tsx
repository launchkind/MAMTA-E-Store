import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  Send,
  MessageCircle,
  Share2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import React from "react";
import { createClient } from "@/lib/supabase/server";
import { SocialMedia } from "@entry/types";

// Icon mapping for different platforms
const getPlatformIcon = (platform: string) => {
  const iconProps = { size: 16 };

  switch (platform.toLowerCase()) {
    case "facebook":
      return <Facebook {...iconProps} />;
    case "instagram":
      return <Instagram {...iconProps} />;
    case "twitter":
      return <Twitter {...iconProps} />;
    case "linkedin":
      return <Linkedin {...iconProps} />;
    case "youtube":
      return <Youtube {...iconProps} />;
    case "telegram":
      return <Send {...iconProps} />;
    case "whatsapp":
      return <MessageCircle {...iconProps} />;
    case "tiktok":
    case "pinterest":
    case "other":
    default:
      return <Share2 {...iconProps} />;
  }
};

const TopSocialLinks = async () => {
  let socialLinks: SocialMedia[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("social_media")
      .select("id, platform, url, icon, is_active, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    socialLinks = (data || []).map((item: Record<string, unknown>) => ({
      _id: item.id,
      href: item.url,
      name: item.platform,
      platform: item.platform,
      icon: item.icon,
    })) as unknown as SocialMedia[];
  } catch (error) {
  }

  if (socialLinks.length === 0) {
    return null; // Don't render if no social links
  }

  return (
    <div className="flex items-center gap-3">
      {socialLinks.map((item) => (
        <Link
          key={item._id}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-background hoverEffect"
          title={item.name}
        >
          {item.icon ? (
            <Image
              src={item.icon}
              alt={item.name}
              width={16}
              height={16}
              className="object-contain"
            />
          ) : (
            getPlatformIcon(item.platform)
          )}
        </Link>
      ))}
    </div>
  );
};

export default TopSocialLinks;
