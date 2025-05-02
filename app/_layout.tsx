// app/_layout.tsx
import { Stack, usePathname } from "expo-router";
import { useFonts } from "expo-font";
import { AuthProvider } from "../context/AuthContext";
import MenuButton from "../components/MenuButton";

export default function Layout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const pathname = usePathname();
  const hideMenuOn = ["/", "/signin", "/signup", "/services/translation", "/about", "/admin/content/[serviceType]", "/admin/football","/admin/services","/admin/tournament", "/admin/content/hotels","/admin/content/restaurants","/admin/content/guides","/admin/content/bank","/admin/content/simCards","/admin/content/transportation"];
  const showMenu = !hideMenuOn.includes(pathname);

  if (!loaded) return null;

  return (
    <AuthProvider>
      {showMenu && <MenuButton />}
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}
