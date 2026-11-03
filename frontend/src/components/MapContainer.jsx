import MetroMap from './MetroMap.jsx'
import BusMap from './BusMap.jsx'

export default function MapContainer(props) {
  const mode = props.mode === 'bus' ? 'bus' : 'metro'
  const routes = mode === 'bus' ? (props.network?.bus_routes ?? []) : (props.network?.metro_lines ?? [])
  const validRouteId = routes.some((route) => route.id === props.selectedRouteId) ? props.selectedRouteId : routes[0]?.id
  const Map = mode === 'bus' ? BusMap : MetroMap
  const mapProps = { ...props, mode, selectedRouteId: validRouteId }
  return <section className="relative h-full min-h-[380px] w-full min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm" aria-label="Transit network map"><div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4"><div><h2 className="font-semibold text-slate-900">{mode === 'bus' ? 'Bus Network Map' : 'Metro Network Map'}</h2><p className="text-xs text-slate-600">Select a station to update your journey</p></div><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{mode === 'bus' ? 'Bus' : 'Metro'}</span></div><div className="h-[calc(100%-65px)] min-h-[300px] w-full overflow-auto p-3 sm:p-5">{validRouteId ? <Map {...mapProps} height={500} /> : <div className="grid h-full min-h-[300px] place-items-center text-sm text-slate-600">Loading route network…</div>}</div></section>
}
