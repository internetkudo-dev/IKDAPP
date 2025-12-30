import { selectToken } from "@/store/auth.slice";
import { useRouter } from "expo-router";
import { ReactNode, useEffect } from "react";
import { InteractionManager } from "react-native";
import { useSelector } from "react-redux";

const AuthGuard = ({ children }: { children: ReactNode }) => {
  const token = useSelector(selectToken);
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      // Delay navigation until after layout & interactions
      InteractionManager.runAfterInteractions(() => {
        router.replace("/auth/login");
      });
    }
  }, [token]);

  if (!token) return null;

  return <>{children}</>;
};

export default AuthGuard;
