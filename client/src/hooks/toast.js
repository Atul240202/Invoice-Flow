import { toast as sonner } from "sonner"; // or any toast lib you're using

export const useToast = () => {
  const toast = ({ title, description, variant }) => {
    sonner[variant === "destructive" ? "error" : "success"](`${title}: ${description}`);
  };

  return { toast };
};
