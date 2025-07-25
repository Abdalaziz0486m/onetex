import PropTypes from "prop-types";

const Card = ({ children, className = "", ...props }) => {
  return (
    <div
      className={`rounded-3 p-3 card ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

// ✨ أضف ده:
export const CardContent = ({ children, className = "", ...props }) => {
  return (
    <div className={`p-3 ${className}`} {...props}>
      {children}
    </div>
  );
};

CardContent.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default Card;
