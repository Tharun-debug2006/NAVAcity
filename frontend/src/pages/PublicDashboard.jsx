import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { api, errorMessage } from '../api/client.js'
import { CROWD_COLORS, CROWD_SENTENCE, OccupancyBar } from '../components/CrowdBadge.jsx'
import MapContainer from '../components/MapContainer.jsx'
import AnswerCard from '../components/AnswerCard.jsx'
import AlternativeCard from '../components/AlternativeCard.jsx'
import CollapsibleSection from '../components/CollapsibleSection.jsx'
import ChartCard, { LegendItem } from '../components/ChartCard.jsx'
import { EmptyState, ErrorState, LoadingSkeleton } from '../components/States.jsx'
import { formatDecimal, formatHour, formatNumber } from '../lib/format.js'
import JourneyPlanner from '../components/JourneyPlanner.jsx'

const localDateISO = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
const now = () => new Date()

export default function PublicDashboard() {
  // ---- Static network -------------------------------------------------
  const [network, setNetwork] = useState(null)
  const [networkError, setNetworkError] = useState(null)

  // ---- User selection --------------------------------------------------
  const [mode, setMode] = useState('metro')
  const [routeId, setRouteId] = useState('M1')
  const [hour, setHour] = useState(now().getHours())
  const [date, setDate] = useState(localDateISO(now()))

  // The origin and the destination of the journey.  They are filtered to the
  // stations the chosen route serves and they really determine the forecast.
  const [originId, setOriginId] = useState('')
  const [destinationId, setDestinationId] = useState('')

  // The controls collapse into a summary bar once a result exists.

  // ---- Server data -----------------------------------------------------
  const [prediction, setPrediction] = useState(null)
  const [predictionError, setPredictionError] = useState(null)
  const [predictionLoading, setPredictionLoading] = useState(false)

  const [dayProfile, setDayProfile] = useState(null)
  const [historyProfile, setHistoryProfile] = useState(null)
  const [alternatives, setAlternatives] = useState(null)
  const [alternativesError, setAlternativesError] = useState(null)
  const [loadingExtras, setLoadingExtras] = useState(false)

  // ---- Load the network once ------------------------------------------
  const loadNetwork = useCallback(async () => {
    try {
      setNetworkError(null)
      const data = await api.network()
      setNetwork(data)
    } catch (error) {
      setNetworkError(errorMessage(error))
    }
  }, [])

  useEffect(() => {
    loadNetwork()
  }, [loadNetwork])

  // ---- Keep the route selection valid for the chosen mode --------------
  const routes = useMemo(() => {
    if (!network) return []
    return mode === 'metro' ? network.metro_lines : network.bus_routes
  }, [network, mode])

  // Switching the mode resets the route list to that mode only.
  const handleModeChange = useCallback((nextMode) => {
    setMode(nextMode)
    if (network) {
      const nextRoutes = nextMode === 'metro' ? network.metro_lines : network.bus_routes
      if (nextRoutes.length && !nextRoutes.some((item) => item.id === routeId)) {
        setRouteId(nextRoutes[0].id)
      }
    }
  }, [network, routeId])

  useEffect(() => {
    if (!routes.length) return
    if (!routes.some((item) => item.id === routeId)) {
      setRouteId(routes[0].id)
    }
  }, [routes, routeId])

  const route = useMemo(
    () => routes.find((item) => item.id === routeId) || null,
    [routes, routeId],
  )

  // The stops of the selected route, as {id, name} pairs for the selects.
  const routeStops = useMemo(() => {
    if (!route) return []
    const names = route.stop_names || []
    return route.stops.map((id, index) => ({
      id,
      name: names[index] || id,
    }))
  }, [route])

  // Keep the origin / the destination valid for the selected route.
  useEffect(() => {
    if (!routeStops.length) return
    if (!routeStops.some((stop) => stop.id === originId)) {
      setOriginId(routeStops[0].id)
    }
    if (!routeStops.some((stop) => stop.id === destinationId)) {
      setDestinationId(routeStops[routeStops.length - 1].id)
    }
  }, [routeStops, originId, destinationId])

  // ---- Prediction ------------------------------------------------------
  // The prediction is driven by the *selected route* and by the journey
  // (origin and destination), so switching the mode never sends a request
  // with a route that belongs to the other mode.
  const loadPrediction = useCallback(async () => {
    if (!route) {
      setPrediction(null)
      setPredictionError(null)
      setPredictionLoading(false)
      return
    }
    setPredictionLoading(true)
    setPredictionError(null)
    try {
      const data = await api.predict({
        route_id: route.id,
        hour: Number(hour),
        date,
        mode: route.mode,
        origin_id: originId || undefined,
        destination_id: destinationId || undefined,
      })
      setPrediction(data)
    } catch (error) {
      setPredictionError(errorMessage(error))
      setPrediction(null)
    } finally {
      setPredictionLoading(false)
    }
  }, [route, hour, date, originId, destinationId])

  useEffect(() => {
    loadPrediction()
  }, [loadPrediction])

  // ---- Day profile + historical profile + alternatives -----------------
  const activeRouteId = route?.id || null

  useEffect(() => {
    if (!activeRouteId || !route) return undefined
    let active = true
    setLoadingExtras(true)
    setAlternativesError(null)

    api
      .predictDay({
        route_id: activeRouteId,
        date,
        origin_id: originId || undefined,
        destination_id: destinationId || undefined,
      })
      .then((data) => active && setDayProfile(data.predictions))
      .catch(() => active && setDayProfile(null))

    api
      .hourlyProfile({ route_id: activeRouteId })
      .then((data) => active && setHistoryProfile(data.points))
      .catch(() => active && setHistoryProfile(null))

    if (route.stops?.length >= 2 && originId && destinationId) {
      api
        .alternatives({
          route_id: activeRouteId,
          origin_id: originId,
          destination_id: destinationId,
          hour: Number(hour),
          date,
          limit: 4,
        })
        .then((data) => active && setAlternatives(data))
        .catch((error) => {
          if (active) {
            setAlternatives(null)
            setAlternativesError(errorMessage(error))
          }
        })
    } else {
      setAlternatives(null)
    }

    return () => {
      active = false
      setLoadingExtras(false)
    }
  }, [activeRouteId, hour, date, route, originId, destinationId])

  // ---- Chart data ------------------------------------------------------
  // The 24-hour chart of the chosen route and day.  The unit is passengers
  // per hour on the busiest stretch of the selected journey.
  const demandChart = useMemo(() => {
    if (!dayProfile) return []
    return dayProfile.map((point) => ({
      hour: point.hour,
      label: formatHour(point.hour),
      passengers: point.predicted_passengers,
      occupancy: point.predicted_occupancy_pct,
      crowd: point.crowd_level,
    }))
  }, [dayProfile])

  const originName = useMemo(
    () => routeStops.find((stop) => stop.id === originId)?.name || '',
    [routeStops, originId],
  )
  const destinationName = useMemo(
    () => routeStops.find((stop) => stop.id === destinationId)?.name || '',
    [routeStops, destinationId],
  )


  // The one-sentence answer a passenger reads first.
  const answerSentence = useMemo(() => {
    if (!prediction) return ''
    const level = prediction.crowd_level
    const base = CROWD_SENTENCE[level] || ''
    if (level === 'Low') {
      return `Expect a quiet service at ${formatHour(prediction.hour)}. ${base}`
    }
    if (level === 'Moderate') {
      return `Expect a moderately crowded service at ${formatHour(prediction.hour)}. ${base}`
    }
    if (level === 'High') {
      return `Expect a crowded service at ${formatHour(prediction.hour)}. ${base}`
    }
    if (level === 'Critical') {
      return `Expect a very crowded service at ${formatHour(prediction.hour)}. ${base}`
    }
    return base
  }, [prediction])

  const requestedTotal = alternatives?.requested_total_journey_time_min

  // ---- Render ----------------------------------------------------------
  if (networkError) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">Plan a journey</h1>
        <ErrorState
          title="The NavaCity API is not reachable"
          message={networkError}
          onRetry={loadNetwork}
        />
        <div className="card text-sm text-slate-600">
          <p className="font-semibold text-slate-800">How to fix this</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>
              Open a terminal in <code className="rounded bg-slate-100 px-1">c:\AI\NavaCity</code>
            </li>
            <li>
              Run{' '}
              <code className="rounded bg-slate-100 px-1">
                python -m uvicorn backend.app.main:app --port 8000
              </code>
            </li>
            <li>
              Check{' '}
              <code className="rounded bg-slate-100 px-1">http://localhost:8000/api/health</code>
            </li>
          </ol>
        </div>
      </div>
    )
  }

  if (!network) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">Plan a journey</h1>
        <div className="card">
          <LoadingSkeleton label="Loading the NavaCity network…" rows={4} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* ================= Controls ================= */}
      <div className="grid min-w-0 grid-cols-1 gap-6 overflow-hidden lg:grid-cols-12">
      <div className="min-w-0 space-y-6 overflow-hidden lg:col-span-5">
      <JourneyPlanner mode={mode} onModeChange={handleModeChange} routeId={routeId} routes={routes} onRouteChange={setRouteId} stops={routeStops} originId={originId} destinationId={destinationId} onOriginChange={setOriginId} onDestinationChange={setDestinationId} hour={hour} onHourChange={setHour} date={date} onDateChange={setDate} onSwap={() => { setOriginId(destinationId); setDestinationId(originId) }} />
      {prediction && <AnswerCard
          crowdLevel={prediction.crowd_level}
          occupancyPct={prediction.predicted_occupancy_pct}
          headline={`${route.id} · ${route.name} — ${originName} to ${destinationName}`}
          sentence={answerSentence}
          waitMinutes={formatDecimal(prediction.waiting_time_min, 1)}
          rideMinutes={formatDecimal(prediction.travel_time_min, 0)}
          totalMinutes={formatDecimal(prediction.total_journey_time_min, 0)}
        ><p className="mt-3 text-xs text-slate-600">{formatNumber(prediction.predicted_passengers)} passengers per hour · {formatDecimal(prediction.predicted_occupancy_pct, 1)}% of planned capacity.</p></AnswerCard>}
      </div><div className="min-w-0 space-y-6 overflow-hidden lg:col-span-7">
      <section className="card min-w-0 overflow-hidden" aria-label="Route summary"><p className="text-sm font-semibold text-slate-900">{mode === 'metro' ? 'Metro' : 'Bus'} · {routeId} {route.name}</p><p className="mt-1 text-sm text-slate-600">{originName} → {destinationName} · {date} · {formatHour(hour)}</p></section>

      {/* ================= Less crowded alternatives ================= */}
      {prediction && (
        <section className="card" aria-label="Less crowded alternatives">
          <h2 className="card-title">Less crowded alternatives</h2>
          <p className="mt-1 text-xs text-slate-500">
            {alternatives
              ? `Other ways to travel from ${alternatives.origin} to ${alternatives.destination} at ${formatHour(hour)} on ${date}.`
              : `Looking for other ways to travel from ${originName} to ${destinationName}…`}
          </p>

          {alternativesError && (
            <p className="mt-3 rounded-control border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900" role="status">
              {alternativesError}
            </p>
          )}

          {!alternatives && !alternativesError && (
            <div className="mt-3">
              <LoadingSkeleton label="Looking for alternatives…" rows={2} />
            </div>
          )}

          {alternatives && alternatives.alternatives.length === 0 && (
            <div className="mt-3">
              <EmptyState
                title="No alternative found"
                message="The observed network does not offer another route for this journey."
              />
            </div>
          )}

          {alternatives && alternatives.alternatives.length > 0 && (
            <>
              {requestedTotal !== null && requestedTotal !== undefined && (
                <p className="mt-2 text-xs text-slate-600">
                  Your route {alternatives.requested_route} takes{' '}
                  <strong className="tabular-nums">{formatDecimal(requestedTotal, 0)} min</strong>{' '}
                  in total. Each option below is compared with that time.
                </p>
              )}
              <ul className="mt-3 space-y-2">
                {alternatives.alternatives.map((item) => (
                  <AlternativeCard
                    key={`${item.route_id}-${item.transfers}-${item.segment_id}`}
                    routeId={item.route_id}
                    routeName={item.route_name}
                    mode={item.mode}
                    totalMinutes={formatDecimal(item.total_journey_time_min, 0)}
                    crowdLevel={item.crowd_level}
                    occupancyPct={item.predicted_occupancy_pct}
                    transfers={item.transfers}
                    differenceMinutes={
                      requestedTotal === null || requestedTotal === undefined
                        ? null
                        : item.total_journey_time_min - requestedTotal
                    }
                    note={item.reason}
                  />
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      {/* ================= The 24-hour chart ================= */}
      {prediction && (
        <ChartCard
          title="Expected crowd by hour"
          subtitle={`${route.id} · ${route.name} · ${date}`}
          legend={
            <>
              <LegendItem color={CROWD_COLORS.Low} label="Low" />
              <LegendItem color={CROWD_COLORS.Moderate} label="Moderate" />
              <LegendItem color={CROWD_COLORS.High} label="High" />
              <LegendItem color={CROWD_COLORS.Critical} label="Critical" />
            </>
          }
          caption="Expected passengers per hour on the busiest stretch of the journey. The selected departure hour is highlighted."
        >
          {!demandChart.length ? (
            <LoadingSkeleton label="Loading the hourly forecast…" rows={3} />
          ) : (
            <ResponsiveContainer width="100%" height={310}>
              <BarChart data={demandChart} margin={{ top: 16, right: 20, left: 32, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  interval={1}
                  label={{
                    value: 'Hour of day',
                    position: 'insideBottom',
                    offset: -8,
                    fontSize: 11,
                    fill: '#64748b',
                  }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  width={56}
                  label={{
                    value: 'Passengers per hour',
                    angle: -90,
                    position: 'insideLeft',
                    fontSize: 11,
                    fill: '#64748b',
                  }}
                />
                <Tooltip
                  formatter={(value, name, item) => [
                    `${formatNumber(value)} passengers per hour`,
                    item?.payload?.crowd ?? 'crowd level',
                  ]}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <ReferenceLine
                  x={formatHour(hour)}
                  stroke="#1d3fbf"
                  strokeWidth={2}
                  label={{ value: 'Your hour', fontSize: 11, fill: '#1d3fbf', position: 'top' }}
                />
                <Bar dataKey="passengers" radius={[4, 4, 0, 0]}>
                  {demandChart.map((entry) => (
                    <Cell key={entry.hour} fill={CROWD_COLORS[entry.crowd] || '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      )}

      {/* ================= The network map ================= */}
      {network && (
        <div className="h-[420px] min-h-[380px] w-full min-w-0 overflow-hidden">
          <MapContainer network={network} selectedRouteId={routeId} mode={mode} originId={originId} destinationId={destinationId} onSelectStation={(id) => { if (!originId || originId === destinationId) setOriginId(id); else setDestinationId(id) }} onSelectRoute={(id, selectedMode) => { handleModeChange(selectedMode); setRouteId(id) }} />
        </div>
      )}


      </div></div>
    </div>
  )
}



