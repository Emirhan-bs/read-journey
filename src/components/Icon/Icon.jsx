const Icon = ({ id, width = 24, height = 24, className }) => (
  <svg width={width} height={height} className={className}>
    <use href={`/icons/sprite.svg#${id}`} />
  </svg>
);

export default Icon;