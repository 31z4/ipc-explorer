export function HeaderWithTooltip ({ header, headerScope, tooltip, tooltipPosition }) {
  return (
    <th scope={headerScope} className='with-tooltip'>
        <span className={`p-tooltip--${tooltipPosition}`} aria-describedby="tooltip">
            {header}&nbsp;<i className="p-icon--information"></i>
            <span className="p-tooltip__message" role="tooltip" id="tooltip">{tooltip}</span>
        </span>
    </th>
  )
}
