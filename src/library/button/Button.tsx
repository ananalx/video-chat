import "./index.css";

const Button = (props: React.ComponentProps<"button">) => {
  return (
    <button
      {...props}
      className="button"
      onMouseEnter={(e) =>
        ((e.target as HTMLButtonElement).style.transform = "scale(1.05)")
      }
      onMouseLeave={(e) =>
        ((e.target as HTMLButtonElement).style.transform = "scale(1)")
      }
    >
      {props.children}
    </button>
  );
};

export default Button;
