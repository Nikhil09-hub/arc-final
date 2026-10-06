import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  MapPin,
  Sparkles,
} from "lucide-react"
import { getAdminEventBySlug, getEventBySlug } from "../services/eventService"
import { createCashfreeOrder, verifyCashfreePayment } from "../services/paymentService"
import { submitRegistration } from "../services/registrationService"
import { getAdminToken } from "../services/authService"

function formatDate(date) {
  if (!date) return "Date TBA"
  const value = new Date(date)
  if (Number.isNaN(value.getTime())) return "Date TBA"
  return value.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function formatTime(date) {
  const value = new Date(date)
  if (Number.isNaN(value.getTime())) return ""
  return value.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  })
}

const fieldClass =
  "mt-2 w-full rounded-lg border border-white/10 bg-[var(--vj-black)] px-4 py-3 text-sm text-[var(--vj-white)] outline-none placeholder:text-white/30 focus:border-[var(--vj-blue)] disabled:opacity-50"

const emptyTeamMember = () => ({ name: "", rollNo: "", email: "", phone: "" })

function getNormalizedPaymentConfig(registration = {}) {
  const payment = registration.payment || {}
  const enabled = Boolean(payment.enabled)
  const amount = Number(payment.amount) || 0
  const feeType = payment.feeType === "per_team" ? "per_team" : "per_participant"

  return {
    enabled,
    amount,
    currency: (payment.currency || "INR").toUpperCase(),
    feeType,
  }
}

function calculateDisplayFee(event, teamSize = 1) {
  const registration = event?.registration || {}
  const paymentConfig = getNormalizedPaymentConfig(registration)

  if (!paymentConfig.enabled || paymentConfig.amount <= 0) {
    return {
      enabled: false,
      amount: 0,
      currency: "INR",
      feeType: "per_participant",
      total: 0,
      label: "FREE",
      description: "Registration Fee",
    }
  }

  const format = registration.format || "individual"
  const amount = paymentConfig.amount

  if (format === "team" && paymentConfig.feeType === "per_team") {
    return {
      enabled: true,
      amount,
      currency: paymentConfig.currency,
      feeType: "per_team",
      total: amount,
      label: `₹${amount} per team`,
      description: `Registration Fee · ${amount} per team`,
    }
  }

  const perParticipantAmount = amount * Math.max(1, teamSize)

  return {
    enabled: true,
    amount,
    currency: paymentConfig.currency,
    feeType: "per_participant",
    total: perParticipantAmount,
    label: `₹${amount} per participant`,
    description: `Registration Fee · ${amount} per participant`,
  }
}

export default function EventRegisterPage() {
  const { slug } = useParams()
  const [event, setEvent] = useState(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState("")

  const [formData, setFormData] = useState({
    fullName: "",
    rollNo: "",
    email: "",
    phone: "",
    college: "",
    department: "",
    year: "",
  })
  const [teamName, setTeamName] = useState("")
  const [teamLeader, setTeamLeader] = useState({
    name: "",
    rollNo: "",
    email: "",
    phone: "",
  })
  const [teamMembers, setTeamMembers] = useState([emptyTeamMember()])

  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState("")
  const [successData, setSuccessData] = useState(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    let active = true

    const loadEvent = async () => {
      setLoading(true)
      setFetchError("")
      try {
        let data
        try {
          data = await getEventBySlug(slug)
        } catch (publicError) {
          if (!getAdminToken()) throw publicError
          data = await getAdminEventBySlug(slug)
        }
        if (active) {
          setEvent(data)
          setCurrentTime(Date.now())
          const registrationTeam = data.registration?.team || {}
          const minMembers = Math.max(
            2,
            Number(registrationTeam.minimumMembers) || 2
          )
          setTeamMembers(
            Array.from({ length: minMembers - 1 }, emptyTeamMember)
          )
        }
      } catch {
        if (active) setFetchError("Unable to load event details.")
      } finally {
        if (active) setLoading(false)
      }
    }

    loadEvent()
    return () => {
      active = false
    }
  }, [slug])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const updateTeamLeader = (field, value) => {
    setTeamLeader((current) => ({ ...current, [field]: value }))
  }

  const updateTeamMember = (index, field, value) => {
    setTeamMembers((current) =>
      current.map((member, memberIndex) =>
        memberIndex === index ? { ...member, [field]: value } : member
      )
    )
  }

  const loadCashfreeSdk = async () => {
    if (window.Cashfree) return

    await new Promise((resolve, reject) => {
      const script = document.createElement("script")
      script.src = "https://sdk.cashfree.com/js/v3/cashfree.js"
      script.async = true
      script.onload = resolve
      script.onerror = () => reject(new Error("Cashfree SDK failed to load."))
      document.body.appendChild(script)
    })
  }

  const openCashfreeCheckout = async ({ paymentSessionId, orderId, registrationId, registrationSummary }) => {
    await loadCashfreeSdk()
    const cashfree = await window.Cashfree.init({ mode: "sandbox" })

    if (!cashfree || typeof cashfree.checkout !== "function") {
      throw new Error("Cashfree checkout is unavailable right now.")
    }

    return new Promise((resolve, reject) => {
      cashfree.checkout({
        paymentSessionId,
        redirectTarget: "_self",
        onSuccess: async () => {
          try {
            const verified = await verifyCashfreePayment({ registrationId, orderId })
            setSuccessData({
              ...registrationSummary,
              _id: registrationId,
              paymentStatus: verified?.data?.paymentStatus || "paid",
              eventName: event.title,
            })
            window.scrollTo({ top: 0, behavior: "smooth" })
            resolve(verified)
          } catch (error) {
            setFormError(error.message || "Payment verification failed. Please contact support.")
            reject(error)
          }
        },
        onFailure: () => {
          const failureError = new Error("Cashfree payment failed. Please try again.")
          setFormError(failureError.message)
          reject(failureError)
        },
        onClose: () => {
          const closeError = new Error("Payment was cancelled. Please try again.")
          setFormError(closeError.message)
          reject(closeError)
        },
      })
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError("")

    const paymentConfig = getNormalizedPaymentConfig(event?.registration || {})
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const registration = event.registration || {}
    const registrationFormat = registration.format || "individual"
    const teamConfig = registration.team || {}
    const minMembers = Number(teamConfig.minimumMembers) || 2
    const maxMembers = Number(teamConfig.maximumMembers) || 4
    let payload
    let registrationSummary = null

    if (registrationFormat === "team") {
      const teamSize = teamMembers.length + 1
      if (teamSize < minMembers || teamSize > maxMembers) {
        setFormError(`Team size must be between ${minMembers} and ${maxMembers} members.`)
        return
      }
      if (teamConfig.teamNameEnabled && teamConfig.teamNameRequired && !teamName.trim()) {
        setFormError("Team name is required.")
        return
      }
      const leader = {
        name: teamLeader.name.trim(),
        rollNo: teamLeader.rollNo.trim(),
        email: teamLeader.email.trim(),
        phone: teamLeader.phone.trim(),
      }
      const members = teamMembers.map((member) => ({
        name: member.name.trim(),
        rollNo: member.rollNo.trim(),
        email: member.email.trim(),
        phone: member.phone.trim(),
      }))
      if (
        Object.values(leader).some((value) => !value) ||
        members.some((member) => Object.values(member).some((value) => !value))
      ) {
        setFormError("Complete all required team member fields.")
        return
      }
      if (
        !emailRegex.test(leader.email) ||
        members.some((member) => !emailRegex.test(member.email))
      ) {
        setFormError("Please provide a valid email address for every team member.")
        return
      }
      payload = {
        eventId: event._id,
        registrationType: "team",
        team: {
          teamName: teamConfig.teamNameEnabled ? teamName.trim() : "",
          leader,
          members,
        },
      }
      registrationSummary = {
        registrationType: "team",
        team: {
          teamName: payload.team.teamName || "Team",
          teamSize: members.length + 1,
          leader,
          members,
        },
      }
    } else {
      const participant = {
        fullName: formData.fullName.trim(),
        rollNo: formData.rollNo.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        college: formData.college.trim(),
        department: formData.department.trim(),
        year: formData.year.trim(),
      }
      if (Object.values(participant).some((value) => !value)) {
        setFormError("Complete all required participant fields.")
        return
      }
      if (!emailRegex.test(participant.email)) {
        setFormError("Please provide a valid email address.")
        return
      }
      payload = {
        eventId: event._id,
        registrationType: "individual",
        ...participant,
      }
      registrationSummary = {
        registrationType: "individual",
        fullName: participant.fullName,
        rollNo: participant.rollNo,
        email: participant.email,
        phone: participant.phone,
        college: participant.college,
        department: participant.department,
        year: participant.year,
      }
    }

    setSubmitting(true)
    try {
      if (paymentConfig.enabled) {
        const orderResponse = await createCashfreeOrder(payload, {
          adminOnly: event.visibility === "admin",
        })
        await openCashfreeCheckout({
          paymentSessionId: orderResponse.data.paymentSessionId,
          orderId: orderResponse.data.orderId,
          registrationId: orderResponse.data.registrationId,
          registrationSummary,
        })
        return
      }

      const response = await submitRegistration(payload, {
        adminOnly: event.visibility === "admin",
      })

      setSuccessData({
        ...response.data,
        eventName: event.title,
      })
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (err) {
      if (err.status === 409) {
        setFormError(
          err.message ||
            "You are already registered for this event with this roll number."
        )
      } else if (err.status === 403) {
        setFormError(err.message || "Registration is not open for this event.")
      } else {
        setFormError(err.message || "Registration failed. Please try again.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--vj-black)] px-5 py-20 text-[var(--vj-white)]">
        <div className="section-container py-16 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--vj-blue)]">
            VJ ARC / REGISTRATION
          </p>
          <p className="mt-3 text-sm text-[var(--vj-muted)]">Loading registration...</p>
        </div>
      </main>
    )
  }

  if (fetchError || !event) {
    return (
      <main className="min-h-screen bg-[var(--vj-black)] px-5 py-20 text-[var(--vj-white)]">
        <div className="section-container py-16 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--vj-blue)]">
            VJ ARC / REGISTRATION
          </p>
          <h1 className="mt-4 text-3xl font-bold">Event Not Found</h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-[var(--vj-muted)]">
            We couldn't find the event you're trying to register for.
          </p>
          <Link
            to="/events"
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-sm transition hover:border-[var(--vj-blue)] hover:text-[var(--vj-blue)]"
          >
            <ArrowLeft size={15} />
            Back to Events
          </Link>
        </div>
      </main>
    )
  }

  // Check registration compatibility
  const regConfig = event.registration || {}
  const isEnabled = Boolean(regConfig.enabled)
  const regType =
    regConfig.type ||
    (regConfig.link ? "external" : isEnabled ? "internal" : "none")
  const registrationFormat = regConfig.format || "individual"
  const teamConfig = regConfig.team || {}
  const minMembers = Number(teamConfig.minimumMembers) || 2
  const maxMembers = Number(teamConfig.maximumMembers) || 4
  const teamSize = registrationFormat === "team" ? Math.max(minMembers, teamMembers.length + 1) : 1
  const feeSummary = calculateDisplayFee(event, teamSize)
  const isPaidEvent = feeSummary.enabled

  const startDate = regConfig.startDate ? new Date(regConfig.startDate).getTime() : null
  const endDate = regConfig.endDate ? new Date(regConfig.endDate).getTime() : null

  const hasValidWindow =
    Number.isFinite(startDate) &&
    Number.isFinite(endDate) &&
    endDate > startDate
  const isNotOpen = hasValidWindow && currentTime < startDate
  const isClosed = !hasValidWindow || currentTime > endDate

  // SUCCESS CONFIRMATION STATE
  if (successData) {
    return (
      <main className="min-h-screen bg-[var(--vj-black)] px-5 py-12 text-[var(--vj-white)] sm:px-6">
        <div className="mx-auto max-w-2xl py-8">
          <div className="rounded-2xl border border-white/10 bg-[var(--vj-dark)] p-7 shadow-2xl sm:p-10 text-center">
            <div className="mx-auto grid size-16 place-items-center rounded-full border border-emerald-400/30 bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 size={36} />
            </div>

            <p className="mt-6 font-mono text-xs uppercase tracking-[0.25em] text-emerald-400">
              ✓ REGISTRATION CONFIRMED
            </p>

            <h1 className="mt-3 text-2xl font-bold sm:text-3xl">
              You're successfully registered!
            </h1>

            <p className="mt-2 text-sm text-[var(--vj-muted)]">
              You are officially registered for:
            </p>

            <div className="mt-4 rounded-xl border border-white/10 bg-[var(--vj-black)] p-4">
              <p className="text-lg font-semibold text-[var(--vj-white)]">
                {event.title}
              </p>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-xs text-[var(--vj-muted)]">
                <span className="flex items-center gap-1.5">
                  <CalendarDays size={14} className="text-[var(--vj-blue)]" />
                  {formatDate(event.startDate)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock3 size={14} className="text-[var(--vj-blue)]" />
                  {formatTime(event.startDate)}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-[var(--vj-blue)]" />
                  {event.venue}
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-left sm:grid-cols-2">
              {successData.registrationType === "team" ? (
                <div className="sm:col-span-2">
                  <p className="font-mono text-[9px] uppercase tracking-wider text-[var(--vj-muted)]">
                    Team
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[var(--vj-white)]">
                    {successData.team.teamName || "Team"} · {successData.team.teamSize} members
                  </p>
                  <p className="mt-2 text-xs text-[var(--vj-muted)]">
                    {[
                      successData.team.leader,
                      ...successData.team.members,
                    ].map((member) => `${member.name} (${member.rollNo})`).join(" · ")}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-wider text-[var(--vj-muted)]">
                    Roll Number
                  </p>
                  <p className="mt-1 font-mono text-sm font-semibold text-[var(--vj-white)]">
                    {successData.rollNo}
                  </p>
                </div>
              )}

              {successData._id && (
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-wider text-[var(--vj-muted)]">
                    Registration ID
                  </p>
                  <p className="mt-1 font-mono text-xs text-[var(--vj-muted)]">
                    {successData._id}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-center">
              <Link
                to={event.visibility === "admin" ? "/admin/events" : `/events/${event.slug}`}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--vj-blue)] px-6 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(37,99,255,0.3)] transition hover:opacity-90"
              >
                <ArrowLeft size={16} />
                {event.visibility === "admin" ? "Back to Admin Events" : "Back to Event"}
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // If internal registration is not configured for this event
  if (!isEnabled || regType !== "internal") {
    return (
      <main className="min-h-screen bg-[var(--vj-black)] px-5 py-20 text-[var(--vj-white)]">
        <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-[var(--vj-dark)] p-8 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--vj-blue)]">
            VJ ARC / REGISTRATION
          </p>
          <h1 className="mt-4 text-2xl font-bold">
            {!isEnabled ? "Registration Unavailable" : "External Registration Only"}
          </h1>
          <p className="mt-3 text-sm text-[var(--vj-muted)]">
            {!isEnabled
              ? "Registration is not enabled for this event."
              : "This event does not accept registrations directly on the VJ ARC website. Please visit the event page to register via the official external link."}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to={event.visibility === "admin" ? "/admin/events" : `/events/${event.slug}`}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--vj-blue)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            >
              <ArrowLeft size={15} />
              {event.visibility === "admin" ? "Back to Admin Events" : "View Event Details"}
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // If internal registration has not opened yet
  if (isNotOpen) {
    return (
      <main className="min-h-screen bg-[var(--vj-black)] px-5 py-20 text-[var(--vj-white)]">
        <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-[var(--vj-dark)] p-8 text-center">
          <span className="inline-block rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1.5 font-mono text-[9px] uppercase tracking-wider text-amber-300">
            Registration Opens Soon
          </span>
          <h1 className="mt-4 text-2xl font-bold">{event.title}</h1>
          <p className="mt-2 text-sm text-[var(--vj-muted)]">
            Registration for this event has not opened yet.
          </p>
          <div className="mt-4 rounded-lg border border-white/10 bg-[var(--vj-black)] p-3 text-xs text-[var(--vj-muted)]">
            Opens on: <span className="font-medium text-white">{formatDate(regConfig.startDate)} · {formatTime(regConfig.startDate)}</span>
          </div>
          <Link
            to={event.visibility === "admin" ? "/admin/events" : `/events/${event.slug}`}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium hover:bg-white/5"
          >
            <ArrowLeft size={15} />
            Back to Event
          </Link>
        </div>
      </main>
    )
  }

  // If internal registration has closed
  if (isClosed) {
    return (
      <main className="min-h-screen bg-[var(--vj-black)] px-5 py-20 text-[var(--vj-white)]">
        <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-[var(--vj-dark)] p-8 text-center">
          <span className="inline-block rounded-full border border-red-400/30 bg-red-400/10 px-3.5 py-1.5 font-mono text-[9px] uppercase tracking-wider text-red-300">
            Registration Closed
          </span>
          <h1 className="mt-4 text-2xl font-bold">{event.title}</h1>
          <p className="mt-2 text-sm text-[var(--vj-muted)]">
            The registration window for this event has ended.
          </p>
          <Link
            to={event.visibility === "admin" ? "/admin/events" : `/events/${event.slug}`}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium hover:bg-white/5"
          >
            <ArrowLeft size={15} />
            Back to Event
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[var(--vj-black)] px-5 py-10 text-[var(--vj-white)] sm:px-6">
      <div className="mx-auto max-w-3xl">
        {/* Top Back Link */}
        <Link
          to={`/events/${event.slug}`}
          className="inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--vj-muted)] transition hover:text-white"
        >
          <ArrowLeft size={14} /> Back to Event
        </Link>

        {/* Event Header Card */}
        <div className="mt-4 rounded-2xl border border-white/10 bg-[var(--vj-dark)] p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[var(--vj-blue)]/40 bg-[var(--vj-blue)]/10 px-3 py-1 font-mono text-[8px] uppercase tracking-[0.18em] text-[var(--vj-blue)]">
              {event.category}
            </span>
            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 font-mono text-[8px] uppercase tracking-[0.18em] text-emerald-400">
              Registration Open
            </span>
          </div>

          <h1 className="mt-3 font-display text-2xl font-bold sm:text-3xl md:text-4xl">
            {event.title}
          </h1>

          <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3">
            <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-[var(--vj-black)] px-3.5 py-2.5 text-xs text-[var(--vj-muted)]">
              <CalendarDays size={15} className="shrink-0 text-[var(--vj-blue)]" />
              <div className="min-w-0">
                <p className="truncate font-medium text-white">{formatDate(event.startDate)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-[var(--vj-black)] px-3.5 py-2.5 text-xs text-[var(--vj-muted)]">
              <Clock3 size={15} className="shrink-0 text-[var(--vj-blue)]" />
              <div className="min-w-0">
                <p className="truncate font-medium text-white">{formatTime(event.startDate)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-[var(--vj-black)] px-3.5 py-2.5 text-xs text-[var(--vj-muted)] sm:col-span-2 md:col-span-1">
              <MapPin size={15} className="shrink-0 text-[var(--vj-blue)]" />
              <div className="min-w-0">
                <p className="truncate font-medium text-white">{event.venue}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Registration Form Card */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-[var(--vj-dark)] p-6 sm:p-8">
          <div className="border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[var(--vj-blue)]" />
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--vj-blue)]">
                VJ ARC / REGISTRATION FORM
              </p>
            </div>
            <h2 className="mt-2 text-xl font-bold sm:text-2xl">
              {registrationFormat === "team" ? "REGISTER YOUR TEAM" : "REGISTER FOR EVENT"}
            </h2>
            <p className="mt-1 text-xs text-[var(--vj-muted)]">
              {event.visibility === "admin"
                ? "Admin-only registration test event."
                : "Roll numbers are unique per event; the same participant may register for other events."}
            </p>
          </div>

          {formError && (
            <div
              role="alert"
              className="mt-6 rounded-lg border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-200"
            >
              {formError}
            </div>
          )}

          <div className="mt-6 rounded-xl border border-white/10 bg-[var(--vj-black)] p-4 sm:p-5">
            <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-[var(--vj-muted)]">
              Registration Fee
            </p>
            <div className="mt-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-xl font-semibold text-[var(--vj-white)]">
                  {feeSummary.enabled ? feeSummary.label : "FREE"}
                </p>
                {registrationFormat === "team" && feeSummary.enabled && feeSummary.feeType === "per_participant" && (
                  <p className="mt-1 text-xs text-[var(--vj-muted)]">
                    Team Size: {teamSize} · Fee: ₹{feeSummary.amount} × {teamSize} · Total: ₹{feeSummary.total}
                  </p>
                )}
                {registrationFormat === "team" && feeSummary.enabled && feeSummary.feeType === "per_team" && (
                  <p className="mt-1 text-xs text-[var(--vj-muted)]">
                    Team Size: {teamSize} · Fee: ₹{feeSummary.amount} per team · Total: ₹{feeSummary.total}
                  </p>
                )}
              </div>
              {feeSummary.enabled && (
                <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-amber-300">
                  Payment Pending
                </span>
              )}
            </div>
            {isPaidEvent && (
              <p className="mt-3 text-xs text-[var(--vj-muted)]">
                Complete the secure Cashfree sandbox checkout after you submit the form.
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {registrationFormat === "team" ? (
              <div className="space-y-6">
                {teamConfig.teamNameEnabled !== false && (
                  <label className="block text-sm text-[var(--vj-muted)]">
                    Team Name {teamConfig.teamNameRequired !== false && <span className="text-red-400">*</span>}
                    <input
                      type="text"
                      value={teamName}
                      onChange={(event) => setTeamName(event.target.value)}
                      required={teamConfig.teamNameRequired !== false}
                      className={fieldClass}
                      maxLength={100}
                    />
                  </label>
                )}

                <section className="space-y-4 rounded-xl border border-white/10 bg-[var(--vj-black)] p-4 sm:p-5">
                  <div>
                    <h3 className="font-semibold">Team Leader</h3>
                    <p className="mt-1 text-xs text-[var(--vj-muted)]">Leader is included in the team size.</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[
                      ["name", "Full Name", "text"],
                      ["rollNo", "Roll Number", "text"],
                      ["email", "Email", "email"],
                      ["phone", "Phone", "tel"],
                    ].map(([field, label, type]) => (
                      <label key={field} className="block text-sm text-[var(--vj-muted)]">
                        {label} <span className="text-red-400">*</span>
                        <input
                          type={type}
                          value={teamLeader[field]}
                          onChange={(event) => updateTeamLeader(field, event.target.value)}
                          required
                          className={fieldClass}
                        />
                      </label>
                    ))}
                  </div>
                </section>

                {teamMembers.map((member, index) => (
                  <section key={index} className="space-y-4 rounded-xl border border-white/10 bg-[var(--vj-black)] p-4 sm:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="font-semibold">Team Member {index + 2}</h3>
                      {teamMembers.length + 1 > minMembers && (
                        <button
                          type="button"
                          onClick={() => setTeamMembers((current) => current.filter((_, memberIndex) => memberIndex !== index))}
                          className="text-xs font-medium text-red-300 hover:text-red-200"
                        >
                          Remove member
                        </button>
                      )}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {[
                        ["name", "Full Name", "text"],
                        ["rollNo", "Roll Number", "text"],
                        ["email", "Email", "email"],
                        ["phone", "Phone", "tel"],
                      ].map(([field, label, type]) => (
                        <label key={field} className="block text-sm text-[var(--vj-muted)]">
                          {label} <span className="text-red-400">*</span>
                          <input
                            type={type}
                            value={member[field]}
                            onChange={(event) => updateTeamMember(index, field, event.target.value)}
                            required
                            className={fieldClass}
                          />
                        </label>
                      ))}
                    </div>
                  </section>
                ))}

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-[var(--vj-muted)]">
                    {teamMembers.length + 1} of {minMembers}–{maxMembers} members
                  </p>
                  {teamMembers.length + 1 < maxMembers && (
                    <button
                      type="button"
                      onClick={() => setTeamMembers((current) => [...current, emptyTeamMember()])}
                      className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium hover:border-[var(--vj-blue)]"
                    >
                      Add team member
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {[
                  ["fullName", "Full Name", "text", "e.g. Rahul Sharma"],
                  ["rollNo", "Roll Number", "text", "e.g. 23N31A1234"],
                  ["email", "Email Address", "email", "e.g. rahul@example.com"],
                  ["phone", "Phone Number", "tel", "e.g. 9876543210"],
                  ["college", "College / Institution", "text", "e.g. VNR VJIET"],
                  ["department", "Department", "text", "e.g. CSE / IT / ECE"],
                  ["year", "Year of Study", "text", "e.g. 1st / 2nd / 3rd / 4th"],
                ].map(([name, label, type, placeholder]) => (
                  <label key={name} className={`block text-sm text-[var(--vj-muted)] ${name === "college" ? "md:col-span-2" : ""}`}>
                    {label} <span className="text-red-400">*</span>
                    <input
                      type={type}
                      name={name}
                      value={formData[name]}
                      onChange={handleChange}
                      placeholder={placeholder}
                      required
                      className={fieldClass}
                    />
                  </label>
                ))}
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting || isPaidEvent}
                className="w-full rounded-lg bg-[var(--vj-blue)] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(37,99,255,0.25)] transition duration-300 hover:opacity-95 disabled:cursor-wait disabled:opacity-50"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Submitting Registration...
                  </span>
                ) : isPaidEvent ? (
                  "Payment Coming Soon"
                ) : (
                  "REGISTER"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
