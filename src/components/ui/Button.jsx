import PropTypes from "prop-types";
import classNames from "classnames";

const Button = ({
  children,
  variant = "primary",
  outline = false,
  type = "button",
  className = "",
  ...props
}) => {
  const btnClass = classNames(
    "btn",
    {
      [`btn-${variant}`]: !outline,
      [`btn-outline-${variant}`]: outline,
    },
    className
  );

  return (
    <button type={type} className={btnClass} {...props}>
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(["primary", "secondary"]),
  outline: PropTypes.bool,
  type: PropTypes.string,
  className: PropTypes.string,
};

export default Button;
