import { useMemo, useState } from 'react'

/**
 * The schematic NavaCity transit map.
 *
 * The network description carries a 0-100 coordinate for every station and
 * stop, so the map is drawn as plain SVG - no external tile server, no API
 * key and no network access required.
 *
 * Colour system (one scheme for the whole application):
 *   * metro lines are solid and use the indigo brand family,
 *   * bus routes are dashed and use the amber bus family,
 *   * the *selected* route is drawn thicker; every other route is dimmed.
 * The crowd palette is never used on the map, so a crowd colour can never be
 * mistaken for a route colour.
 */
const WIDTH = 1000
const HEIGHT = 1000
const PAD = 60

const ROUTE_PALETTE = ['#38bdf8', '#34d399', '#f472b6', '#fbbf24', '#a78bfa', '#fb7185', '#2dd4bf', '#c084fc', '#bef264', '#60a5fa']
export const MAP_COLORS = { metro: '#38bdf8', bus: '#fbbf24', station: '#e2e8f0', stationFill: '#0f172a', interchange: '#ffffff' }

function toPixels(place) {
  const x = PAD + (place.x / 100) * (WIDTH - 2 * PAD)
  const y = PAD + (place.y / 100) * (HEIGHT - 2 * PAD)
  return [x, y]
}

function routePoints(stops, placeById) {
  return stops
    .map((id) => placeById[id])
    .filter(Boolean)
    .map((place) => {
      const [x, y] = toPixels(place)
      return `${x},${y}`
    })
}

export default function TransitMap({
  network,
  selectedRouteId,
  originId,
  destinationId,
  onSelectStation,
  onSelectRoute,
  height = 480,
  showLabels = true,
}) {
  const [hovered, setHovered] = useState(null)

  const geometry = useMemo(() => {
    if (!network) return { lines: [], places: [] }
    const stations = network.places ?? []
    const metroRoutes = network.metro_lines ?? []
    const busRoutes = network.bus_routes ?? []
    const placeById = Object.fromEntries(stations.map((p) => [p.id, p]))

    const lines = []
    let paletteIndex = 0
    for (const line of metroRoutes) {
      const points = routePoints(line.stops, placeById)
      if (points.length > 1) {
        lines.push({ id: line.id, name: line.name, mode: 'metro', points, stops: line.stops ?? [], color: ROUTE_PALETTE[paletteIndex++ % ROUTE_PALETTE.length] })
      }
    }
    for (const route of busRoutes) {
      const points = routePoints(route.stops, placeById)
      if (points.length > 1) {
        lines.push({ id: route.id, name: route.name, mode: 'bus', points, stops: route.stops ?? [], color: ROUTE_PALETTE[paletteIndex++ % ROUTE_PALETTE.length] })
      }
    }

    const places = stations.map((place) => {
      const [x, y] = toPixels(place)
      return { ...place, px: x, py: y }
    })

    return { lines, places }
  }, [network])

  if (!network) {
    return <div className="skeleton w-full" style={{ height }} />
  }

  const hasSelection = Boolean(selectedRouteId)

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-full w-full"
        role="img"
        aria-label="Schematic map of the NavaCity transit network"
      >
        <rect width={WIDTH} height={HEIGHT} fill="#f8fafc" rx={18} />
        {Array.from({ length: 11 }, (_, i) => <g key={`grid-${i}`} stroke="#e2e8f0" strokeWidth="1"><line x1={PAD + i * 88} y1={PAD} x2={PAD + i * 88} y2={HEIGHT-PAD}/><line x1={PAD} y1={PAD + i * 88} x2={WIDTH-PAD} y2={PAD + i * 88}/></g>)}

        {geometry.lines.map((line) => {
          const isSelected = line.id === selectedRouteId
          const color = line.color
          const dimmed = hasSelection && !isSelected
          return (
            <g key={`${line.mode}-${line.id}`}>
              <polyline
                points={line.points.join(' ')}
                fill="none"
                stroke={color}
                strokeWidth={isSelected ? 5 : line.mode === 'metro' ? 4 : 3}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={line.mode === 'bus' ? '10 7' : undefined}
                opacity={dimmed ? 0.18 : 1}
                className="cursor-pointer"
                onClick={() => onSelectRoute && onSelectRoute(line.id, line.mode)}
                onMouseEnter={() => setHovered(`${line.mode}-${line.id}`)}
                onMouseLeave={() => setHovered(null)}
              >
                <title>{`${line.id} ${line.name}`}</title>
              </polyline>
              {isSelected && originId && destinationId && (() => {
                const from = line.stops.indexOf(originId)
                const to = line.stops.indexOf(destinationId)
                if (from < 0 || to < 0 || from === to) return null
                const [start, end] = [Math.min(from, to), Math.max(from, to)]
                const segment = line.stops.slice(start, end + 1).map((id) => {
                  const place = network.places.find((item) => item.id === id)
                  return place ? toPixels(place).join(',') : null
                }).filter(Boolean).join(' ')
                return <polyline points={segment} fill="none" stroke="#1d4ed8" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" pointerEvents="none" />
              })()}
            </g>
          )
        })}

        {geometry.places.map((place) => {
          const isSelected =
            (place.metro_lines ?? []).includes(selectedRouteId) ||
            (place.bus_routes ?? []).includes(selectedRouteId)
          const isInterchange = (place.metro_lines ?? []).length > 0 && (place.bus_routes ?? []).length > 0
          const isHovered = hovered === place.id
          // The label is drawn for the selected route, the hovered place and
          // the interchanges, so the map stays readable at every zoom level.
          const showLabel = showLabels && (isSelected || isHovered || isInterchange)
          const onRight = place.px > WIDTH * 0.78
          const labelAnchor = onRight ? 'end' : 'start'
          const labelX = onRight ? place.px - 10 : place.px + 10
          return (
            <g
              key={place.id}
              onMouseEnter={() => setHovered(place.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <circle
                cx={place.px}
                cy={place.py}
                r={isInterchange ? 7 : isSelected ? 6 : 4}
                fill={isSelected ? '#2563eb' : '#ffffff'}
                stroke={isSelected ? '#1d4ed8' : '#475569'}
                strokeWidth={3}
                className={onSelectStation ? 'cursor-pointer' : undefined}
                onClick={() => onSelectStation?.(place.id)}
              >
                <title>{place.name}</title>
              </circle>
              {showLabel && (
                <text
                  x={labelX}
                  y={place.py + 4}
                  textAnchor={labelAnchor}
                  className="pointer-events-none select-none"
                  fontSize="15"
                  fontWeight="600"
                  fill="#1e293b"
                  stroke="#ffffff"
                  strokeWidth="5"
                  paintOrder="stroke"
                  style={{ paintOrder: 'stroke', stroke: '#ffffff', strokeWidth: '5px', fill: '#1e293b' }}
                >
                  {place.name}
                </text>
              )}
            </g>
          )
        })}
      </svg>

      {/* ---------------- Legend ---------------- */}
      <div className="pointer-events-none relative mb-3 flex flex-row flex-wrap gap-3 rounded-control border border-slate-200 bg-white p-2 text-[11px] shadow-sm">
        <span className="flex items-center gap-2 font-medium text-slate-700">
          <span
            aria-hidden="true"
            className="inline-block h-0.5 w-5 rounded-full"
            style={{ backgroundColor: MAP_COLORS.metro }}
          />
          Metro line (solid)
        </span>
        <span className="flex items-center gap-2 font-medium text-slate-700">
          <span
            aria-hidden="true"
            className="inline-block h-0.5 w-5 rounded-full"
            style={{
              backgroundImage: `repeating-linear-gradient(90deg, ${MAP_COLORS.bus} 0 5px, transparent 5px 9px)`,
            }}
          />
          Bus route (dashed)
        </span>
        <span className="flex items-center gap-2 font-medium text-slate-700">
          <span
            aria-hidden="true"
            className="inline-block h-2.5 w-2.5 rounded-full border-2 border-metro-700 bg-white"
          />
          Station or stop
        </span>
      </div>

      {selectedRouteId && (
        <div className="pointer-events-none absolute bottom-3 right-3 rounded-control border border-slate-200 bg-white/95 px-2 py-1 text-[11px] text-slate-600 shadow-sm">
          The selected route is drawn thicker.
        </div>
      )}
    </div>
  )
}
