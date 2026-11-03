import { useMemo } from 'react'
import TransitMap from './TransitMap.jsx'

export default function BusMap({ network, selectedRouteId, ...props }) {
  const routes = network?.bus_routes ?? []
  const routeId = routes.some((r) => r.id === selectedRouteId) ? selectedRouteId : routes[0]?.id
  const selected = useMemo(() => routes.find((r) => r.id === routeId), [routes, routeId])
  const focusedNetwork = useMemo(() => network ? { ...network, metro_lines: [], bus_routes: routes.filter((r) => r.id === routeId), places: network.places ?? [] } : null, [network, routes, routeId])
  return <div className="space-y-4"><TransitMap network={focusedNetwork} selectedRouteId={selectedRouteId} {...props} /><section className="rounded-xl border border-slate-200 bg-slate-50 p-4" aria-label="Route stop timeline"><h3 className="font-semibold text-slate-900">Route stop timeline</h3>{selected ? <ol className="mt-3 flex flex-wrap gap-2">{selected.stops.map((id, i) => { const place = network.places.find(p=>p.id===id); return <li key={id} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"><span className="grid h-6 w-6 place-items-center rounded-full bg-blue-600 text-xs font-bold text-white">{i+1}</span>{place?.name || id}</li> })}</ol> : <p className="mt-2 text-sm text-slate-600">Choose a route to see its stops.</p>}</section></div>
}
