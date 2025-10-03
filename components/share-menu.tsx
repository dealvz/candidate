"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Share2, Link as LinkIcon, Twitter, Facebook, Linkedin } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface ShareMenuProps {
  url: string; // absolute URL to the candidate page
  title: string; //"Jane Doe for Mayor of Springfield"
  hashtags?: string[];
}

export default function ShareMenu({ url, title, hashtags = [] }: ShareMenuProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(title);
  const encodedHashtags = hashtags.join(",");

  const xUrl = `https://x.com/intent/post?text=${encodedText}&url=${encodedUrl}${encodedHashtags ? `&hashtags=${encodedHashtags}` : ""}`;
  const facebookUrl = `https://www.facebook.com/sharer.php?u=${encodedUrl}${encodedText ? `&quote=${encodedText}` : ""}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;

  const [shouldUseNativeShare, setShouldUseNativeShare] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof navigator === "undefined") {
      setShouldUseNativeShare(false);
      return;
    }

    const supportsShare = typeof navigator.share === "function";
    if (!supportsShare) {
      setShouldUseNativeShare(false);
      return;
    }

    let canShareUrl = true;
    if (typeof navigator.canShare === "function") {
      try {
        canShareUrl = navigator.canShare({ url });
      } catch {
        canShareUrl = false;
      }
    }

    const userAgent = navigator.userAgent ?? "";
    const platform = navigator.platform ?? "";
    const touchPoints = (navigator as Navigator & { maxTouchPoints?: number }).maxTouchPoints ?? 0;

    const isTouchDevice = /(android|iphone|ipad|ipod|mobile|silk|tablet|windows phone)/i.test(userAgent);
    const isTouchEnabledMac = /mac/i.test(platform) && touchPoints > 1;

    setShouldUseNativeShare(canShareUrl && (isTouchDevice || isTouchEnabledMac));
  }, [url]);

  const attemptNativeShare = useCallback(async () => {
    if (!shouldUseNativeShare || typeof navigator === "undefined" || typeof navigator.share !== "function") {
      return false;
    }

    try {
      await navigator.share({ title, url });
      return true;
    } catch {
      return false;
    }
  }, [shouldUseNativeShare, title, url]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied", {
        description: "The candidate profile URL is ready to share.",
      });
    } catch {
      toast.error("Could not copy the link", {
        description: "Please try again or use your device share sheet.",
      });
    }
  }, [url]);

  const shareTargets = [
    {
      label: "Share on X",
      description: "Post to your followers immediately.",
      icon: Twitter,
      href: xUrl,
    },
    {
      label: "Share on Facebook",
      description: "Start a conversation with your network.",
      icon: Facebook,
      href: facebookUrl,
    },
    {
      label: "Share on LinkedIn",
      description: "Highlight the candidate to professional contacts.",
      icon: Linkedin,
      href: linkedinUrl,
    },
  ];

  const handleMenuOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        void (async () => {
          const usedNativeShare = await attemptNativeShare();
          if (!usedNativeShare) {
            setMenuOpen(true);
          }
        })();
        return;
      }

      setMenuOpen(false);
    },
    [attemptNativeShare]
  );

  return (
    <DropdownMenu open={menuOpen} onOpenChange={handleMenuOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="Share candidate profile"
          size="sm"
          variant="outline"
          className="gap-2"
        >
          <Share2 className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline-flex">Share</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 space-y-1">
        <DropdownMenuLabel>Share profile</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {shareTargets.map(({ label, description, icon: Icon, href }) => (
          <DropdownMenuItem
            key={label}
            asChild
            onSelect={() => {
              setMenuOpen(false);
            }}
            className="items-start"
          >
            <a href={href} target="_blank" rel="noopener noreferrer" className="flex w-full items-start gap-3">
              <Icon className="size-4" aria-hidden="true" />
              <div className="flex flex-col gap-0.5 text-left">
                <span className="text-sm font-semibold text-foreground">{label}</span>
                <span className="text-xs text-muted-foreground">{description}</span>
              </div>
            </a>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            setMenuOpen(false);
            handleCopy();
          }}
          className="items-start"
        >
          <LinkIcon className="size-4" aria-hidden="true" />
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-foreground">Copy link</span>
            <span className="text-xs text-muted-foreground">
              Add the profile URL anywhere you need it.
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}