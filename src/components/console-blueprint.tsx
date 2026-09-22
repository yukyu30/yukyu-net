export function ConsoleBlueprint() {
  return <svg viewBox="0 0 480 600" className="console-blueprint" aria-hidden="true" fill="none">
    <defs>
      <pattern id="blueprint-grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" stroke="currentColor" strokeOpacity=".1" /></pattern>
      <path id="blueprint-star" d="M0-18 6-6 19-4 9 6 11 20 0 13-11 20-9 6-19-4-6-6Z" />
    </defs>
    <rect width="480" height="600" fill="url(#blueprint-grid)" />
    <g stroke="currentColor" strokeWidth="1">
      <rect x="67" y="65" width="346" height="453" rx="17" />
      <rect x="73" y="71" width="334" height="441" rx="12" />
      <rect x="82" y="80" width="316" height="423" rx="8" strokeOpacity=".4" />
      <rect x="103" y="137" width="274" height="246" rx="11" />
      <rect x="110" y="144" width="260" height="232" rx="8" />
      <rect x="120" y="154" width="240" height="212" rx="5" />
      <path d="M240 48V536 M52 260H428" strokeDasharray="5 5" strokeOpacity=".35" />
      {[94,386].flatMap(x => [97,485].map(y => <g key={`${x}-${y}`}>
        <circle cx={x} cy={y} r="10" /><circle cx={x} cy={y} r="6" />
        <path d={`M${x-4} ${y+2}l8-4 M${x-15} ${y}h5 M${x+10} ${y}h5 M${x} ${y-15}v5 M${x} ${y+10}v5`} />
      </g>))}
      {[157,240,323].map(x => <g key={x} transform={`translate(${x} 437)`}><circle r="25" strokeDasharray="2 4" strokeOpacity=".4" /><use href="#blueprint-star" /><path d="M-29 0H29 M0-28V28" strokeOpacity=".3" /></g>)}
      <g strokeOpacity=".65">
        <path d="M67 57V32 M413 57V32 M67 40H413 M63 44l8-8 M409 44l8-8 M59 65H30 M59 518H30 M39 65V518 M35 69l8-8 M35 522l8-8" />
        <path d="M377 153l52-36h34 M323 437l99-35h42 M94 97l38-28h60" />
      </g>
    </g>
    <g fill="currentColor" fontFamily="monospace" fontSize="9" letterSpacing="1">
      <text x="211" y="32">FRONT VIEW</text>
      <text x="26" y="320" transform="rotate(-90 26 320)">ENCLOSURE / 01</text>
      <text x="401" y="109">LCD</text><text x="414" y="395">KEY ×3</text>
      <text x="137" y="61">M2 ×4</text>
      <text x="120" y="280" fillOpacity=".4">DISPLAY ASSEMBLY</text>
      <text x="68" y="548">YUKYU / POCKET CONSOLE</text>
      <text x="68" y="566" fillOpacity=".6">ASSEMBLING…</text><text x="340" y="566">REV. 01</text>
    </g>
  </svg>
}
