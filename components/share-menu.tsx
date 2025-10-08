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
import { useCallback, useEffect, useMemo, useState } from "react";

interface ShareMenuProps {
  url: string; // absolute URL to the candidate page
  title: string; //"Jane Doe for Mayor of Springfield"
  hashtags?: string[];
}

export default function ShareMenu({ url, title, hashtags = [] }: ShareMenuProps) {
  const normalizedHashtags = useMemo(
    () =>
      hashtags
        .map((tag) => tag.trim().replace(/^#/, ""))
        .filter(Boolean),
    [hashtags],
  );

  const shareTargets = useMemo(() => {
    const xParams = new URLSearchParams();
    if (title) {
      xParams.set("text", title);
    }
    xParams.set("url", url);
    if (normalizedHashtags.length > 0) {
      xParams.set("hashtags", normalizedHashtags.join(","));
    }

    const facebookUrl = `https://www.facebook.com/share_channel/?type=reshare&link=${encodeURIComponent(
      url,
    )}&source_surface=external_reshare`;

    const linkedinUrl = `https://www.linkedin.com/feed/?shareActive=true&shareUrl=${encodeURIComponent(
      url,
    )}`;

    return [
      {
        label: "Share on X",
        description: "Post to your followers immediately.",
        icon: Twitter,
        href: `https://x.com/intent/post?${xParams.toString()}`,
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
  }, [normalizedHashtags, title, url]);

  const [menuOpen, setMenuOpen] = useState(false);
  const [sharePreference, setSharePreference] = useState<"unknown" | "native" | "fallback">(
    "unknown",
  );

  useEffect(() => {
    if (typeof navigator === "undefined") {
      setSharePreference("fallback");
      return;
    }

    if (typeof navigator.share !== "function") {
      setSharePreference("fallback");
      return;
    }

    const userAgent = navigator.userAgent ?? "";
    const platform = navigator.platform ?? "";
    const touchPoints = (navigator as Navigator & { maxTouchPoints?: number }).maxTouchPoints ?? 0;

    const isTouchDevice = /(android|iphone|ipad|ipod|mobile|silk|tablet|windows phone)/i.test(userAgent);
    const isTouchEnabledMac = /mac/i.test(platform) && touchPoints > 1;

    setSharePreference(isTouchDevice || isTouchEnabledMac ? "native" : "fallback");
  }, []);

  const attemptNativeShare = useCallback(async () => {
    if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
      return "unsupported" as const;
    }

    const userAgent = navigator.userAgent ?? "";
    const platform = navigator.platform ?? "";
    const touchPoints = (navigator as Navigator & { maxTouchPoints?: number }).maxTouchPoints ?? 0;

    const isTouchDevice = /(android|iphone|ipad|ipod|mobile|silk|tablet|windows phone)/i.test(userAgent);
    const isTouchEnabledMac = /mac/i.test(platform) && touchPoints > 1;

    if (!isTouchDevice && !isTouchEnabledMac) {
      return "unsupported" as const;
    }

    const sharePayload = { title, url };

    try {
      if (typeof navigator.canShare === "function" && !navigator.canShare(sharePayload)) {
        return "unsupported" as const;
      }
    } catch {
      // navigator.canShare may throw for unsupported payloads; ignore and try anyway.
    }

    try {
      await navigator.share(sharePayload);
      return "success" as const;
    } catch (error) {
      const abortErrorName = "AbortError";
      if (
        (error instanceof DOMException && error.name === abortErrorName) ||
        (typeof error === "object" && error !== null && "name" in error && (error as { name: string }).name === abortErrorName) ||
        (typeof error === "string" && error === abortErrorName)
      ) {
        return "aborted" as const;
      }
      return "error" as const;
    }
  }, [title, url]);

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

  const handleMenuOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        setMenuOpen(false);
        return;
      }

      if (sharePreference === "fallback") {
        setMenuOpen(true);
        return;
      }

      void (async () => {
        const result = await attemptNativeShare();

        if (result === "success" || result === "aborted") {
          setSharePreference("native");
          return;
        }

        setSharePreference("fallback");
        setMenuOpen(true);
      })();
    },
    [attemptNativeShare, sharePreference],
  );

  const handleButtonClick = useCallback(() => {
    if (sharePreference === "native") {
      void attemptNativeShare();
    }
  }, [attemptNativeShare, sharePreference]);

  if (sharePreference === "native") {
    return (
      <Button
        aria-label="Share candidate profile"
        size="sm"
        variant="outline"
        className="gap-2"
        onClick={handleButtonClick}
      >
        <Share2 className="size-4" aria-hidden="true" />
        <span className="hidden sm:inline-flex">Share</span>
      </Button>
    );
  }

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
