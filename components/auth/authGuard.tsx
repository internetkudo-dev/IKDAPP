import { selectToken } from "@/store/auth.slice";
import { useRouter } from "expo-router";
import { ReactNode, useEffect } from "react";
import { InteractionManager } from "react-native";
import { useSelector } from "react-redux";

const AuthGuard = ({ children }: { children: ReactNode }) => {
  // DEVELOPMENT MODE: Bypass authentication
  // TODO: Re-enable auth check when ready
  const DEV_BYPASS_AUTH = true;

  const token = useSelector(selectToken);
  const router = useRouter();

  useEffect(() => {
    if (!DEV_BYPASS_AUTH && !token) {
      // Delay navigation until after layout & interactions
      InteractionManager.runAfterInteractions(() => {
        router.replace("/auth/login");
      });
    }
  }, [token]);

  if (!DEV_BYPASS_AUTH && !token) return null;

  return <>{children}</>;
};

export default AuthGuard;
