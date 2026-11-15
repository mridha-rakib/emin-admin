"use client";
import { useState } from "react";
import {
  Briefcase,
  ChartBarStacked,
  ClipboardList,
  Crown,
  IdCard,
  LayoutDashboard,
  LogOut,
  MessageSquareWarning,
  PackageSearch,
  ShieldCheck,
  RssIcon,
  Settings,
  Tags,
  User,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "../ui/sidebar";
import { useTranslation } from "@/context/LanguageContext";
import { useAuthStore } from "@/store/auth-store";

const AppSidebar = () => {
  const { state } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const logout = useAuthStore((store) => store.logout);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const items = [
    {
      title: t.nav.dashboard,
      url: "/",
      icon: LayoutDashboard,
    },
    {
      title: t.nav.customers,
      url: "/customers",
      icon: UserCheck,
    },
    {
      title: t.nav.providers,
      url: "/providers",
      icon: Briefcase,
    },
    {
      title: t.nav.bookings,
      url: "/bookings",
      icon: ClipboardList,
    },
    {
      title: t.nav.products,
      url: "/products",
      icon: PackageSearch,
    },
    {
      title: t.nav.categories,
      url: "/category",
      icon: Tags,
    },
    {
      title: t.nav.identityVerification,
      url: "/identity-verifications",
      icon: IdCard,
    },
    {
      title: t.nav.chatgptOversight,
      url: "/chatgpt-oversight",
      icon: ShieldCheck,
    },
    {
      title: t.nav.platformCustomization,
      url: "/platform-customization",
      icon: ChartBarStacked,
    },
    {
      title: t.nav.users,
      url: "/users",
      icon: Users,
    },
    {
      title: t.nav.admins,
      url: "/admins",
      icon: User,
    },
    {
      title: t.nav.earnings,
      url: "/earnings",
      icon: Wallet,
    },
    {
      title: t.nav.subscription,
      url: "/subscription",
      icon: Crown,
    },
    {
      title: t.nav.reports,
      url: "/reports",
      icon: MessageSquareWarning,
    },
    {
      title: t.nav.settings,
      url: "/settings",
      icon: Settings,
    },
  ];

  const isActive = (url: string) => {
    if (url === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(url);
  };

  return (
    <Sidebar className="border-r border-border/80" collapsible="icon">
      {/* sidebar header - aligned with Navbar h-16 md:h-18 */}
      <SidebarHeader className="flex h-16 md:h-18 items-center justify-center border-b border-border/80 px-4 group-data-[collapsible=icon]:px-2">
        <Link href="/" className="flex items-center justify-center">
          <Image
            src="/logo.png"
            alt="Odaboo Logo"
            width={220}
            height={70}
            className="h-14 md:h-15 w-auto max-w-[190px] md:max-w-[210px] scale-115 group-data-[collapsible=icon]:scale-100 group-data-[collapsible=icon]:max-w-[42px] object-contain transition-transform hover:scale-120"
            priority
          />
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-1 py-2">
        <SidebarGroup>
          {/* <SidebarGroupLabel className="text-base font-semibold">Application</SidebarGroupLabel> */}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-1">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="h-10 text-xs font-semibold md:h-11 md:text-sm rounded-xl transition-all"
                    isActive={isActive(item.url)}
                  >
                    <Link
                      href={item.url}
                      className={`flex items-center gap-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 px-3 py-2 rounded-xl transition-all ${
                        isActive(item.url)
                          ? "bg-primary text-white font-bold shadow-xs shadow-primary/30"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                      }`}
                    >
                      <item.icon className="h-4.5 w-4.5 group-data-[collapsible=icon]:h-5 group-data-[collapsible=icon]:w-5 shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* sidebar footer */}
      <SidebarFooter className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="h-10 rounded-xl border border-destructive/30 text-xs font-bold text-destructive transition-all hover:bg-destructive hover:text-white md:h-11 md:text-sm cursor-pointer"
              onClick={() => setLogoutModalOpen(true)}
            >
              <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 px-1">
                <LogOut className="h-4.5 w-4.5 shrink-0" />
                <span className="group-data-[collapsible=icon]:hidden font-bold">
                  {t.nav.logout}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      {/* Logout Confirmation Modal */}
      <Dialog open={logoutModalOpen} onOpenChange={setLogoutModalOpen} modal={false}>
        <DialogContent className="bg-background sm:max-w-106.25">
          <DialogHeader className="space-y-3">
            <div className="bg-destructive/10 mx-auto flex h-12 w-12 items-center justify-center rounded-full">
              <LogOut className="text-destructive h-6 w-6" />
            </div>
            <DialogTitle className="text-center text-xl font-semibold">
              {t.nav.logoutConfirmTitle}
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-muted-foreground text-center text-sm">
              {t.nav.logoutConfirmDesc}
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLogoutModalOpen(false)}
              className="flex-1"
            >
              {t.common.cancel}
            </Button>
            <Button
              type="button"
              onClick={() => {
                logout();
                setLogoutModalOpen(false);
                router.push("/login");
              }}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground flex-1"
            >
              {t.nav.logout}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
};

export default AppSidebar;
