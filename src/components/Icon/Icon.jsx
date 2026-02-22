const Icon=({ id, width=20, height=20, className='' })=>{
    return ( <svg width={width} height={height} className={className}>
        <use href={`icons/sprite.svg#${id}`} />
    </svg> );  
}
export default Icon;