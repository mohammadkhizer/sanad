# Sanad: Brand and Design System

## 1. Brand
- **Name:** Sanad (سند), "chain of authority": trust through verified lineage
- **Tagline ideas:** "Knowledge, with a chain of trust." / "Learn from the verified."
- **Tone:** calm, scholarly, respectful, welcoming

## 2. Colour Palette (60:30:10)
| Share | Role | Name | Light | Dark |
|---|---|---|---|---|
| 60% | Backgrounds/surfaces | Warm Ivory / Night Green | `#F8F5EE` | `#0E1512` |
| 30% | Headers, nav, cards | Deep Emerald | `#0F4C45` | `#1B3B35` |
| 10% | CTAs, badge, accents | Antique Gold | `#C9A227` | `#C9A227` |

**Text:** `#1F2933` on ivory, `#FFFFFF` on emerald, `#F2EFE6` on dark  
**Semantic:** success `#2E7D5B`, warning `#D98E04`, error `#B3261E`, info `#2F6F9F`

> Verify contrast: gold text on ivory fails WCAG AA; use gold only as a fill with dark text (`#1F2933`) on it.

## 3. Typography
| Use | Font |
|---|---|
| Latin headings | Playfair Display / Merriweather |
| Latin body/UI | Inter |
| Arabic | Noto Naskh Arabic / Amiri |
| Urdu | Noto Nastaliq Urdu |

Scale: 12 / 14 / 16 / 20 / 24 / 32. Support RTL via `I18nManager`.

## 4. Spacing, Shape, Elevation
- 4pt grid: 4, 8, 12, 16, 24, 32
- Radius: 8 (inputs), 16 (cards), 999 (pills)
- Subtle shadows; prefer borders in dark mode

## 5. Core Components
- Verified badge (gold seal with check), scholar card, Reel player, live banner, chat bubble, application stepper, report sheet, role-gated admin table
- States: default, pressed, disabled, loading, error, empty

## 6. Key Screens
Splash · Login/Register · OTP · Feed (Reels) · Explore · Scholar profile · Upload · Go Live · Live room · Inbox · Chat · Video call · Apply as scholar · Admin queue · Reports · Settings

## 7. UX Principles
- Verified badge always visible near scholar name
- One-tap report/block
- Respect prayer-time quiet hours for notifications (optional setting)
- Minimal, non-addictive feed: no autoplay streaks or engagement nagging

## 8. Accessibility
- Min tap target 44×44, dynamic text sizes, captions on videos, screen-reader labels
- Don't rely on colour alone
