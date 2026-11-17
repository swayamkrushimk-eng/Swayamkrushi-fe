import { splitCaption } from '../utils/mediaUtils'

function formatKicker(value) {
  return String(value || '').trim().toUpperCase()
}

export default function CaptionText({ caption, title, subtitle }) {
  if (title && subtitle) {
    return `${formatKicker(title)} : ${String(subtitle).trim()}`
  }

  const parts = splitCaption(caption)
  if (!parts) return null
  if (!parts.kicker) return parts.rest

  return `${formatKicker(parts.kicker)} : ${parts.rest}`
}
