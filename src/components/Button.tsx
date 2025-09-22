import { ReactNode } from "react";
import styles from "./Button.module.css";

type ButtonVariant = keyof typeof styles;

type ButtonProps = {
  children: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: ButtonVariant;
};

function Button({ children, onClick, type = "primary" }: ButtonProps) {
  const variantClass = styles[type] ?? styles.primary;
  return (
    <button onClick={onClick} className={`${styles.btn} ${variantClass}`}>
      {children}
    </button>
  );
}

export default Button;
