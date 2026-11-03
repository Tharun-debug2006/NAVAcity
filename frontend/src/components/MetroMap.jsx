import TransitMap from './TransitMap.jsx'
export default function MetroMap({ network, ...props }) { return <TransitMap network={network ? { ...network, bus_routes: [], metro_lines: (network.metro_lines ?? []) } : null} {...props} /> }
