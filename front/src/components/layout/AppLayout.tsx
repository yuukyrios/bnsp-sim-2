import { LogOut } from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "./AppSidebar";
import { clearAuth, getUser } from "@/lib/auth";

const titleFor = (path: string) => {
  if (path === "/") return "Dashboard";
  if (path.startsWith("/deliveries")) return "Deliveries";
  if (path.startsWith("/items")) return "Items";
  if (path.startsWith("/admins")) return "Admins";
  return "CargoMoms";
};

export const AppLayout = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = getUser();

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b bg-card px-4 sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <h1 className="text-lg font-semibold">{titleFor(pathname)}</h1>
            </div>
            <div className="flex items-center gap-3">
              {user && (
                <span className="hidden sm:inline text-sm text-muted-foreground">
                  Signed in as <span className="font-medium text-foreground">{user.username}</span>
                </span>
              )}
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-1.5" /> Logout
              </Button>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};