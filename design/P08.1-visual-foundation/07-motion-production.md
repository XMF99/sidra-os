# THEKY P08.1 — Production Motion & Animation Specifications

> **Program P08.1: Visual Foundation Production**  
> **Document:** 07-motion-production.md  
> **Governance Authority:** Supreme Governance ([ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/docs/02-architecture/ARCHITECTURE-LOCK.md))  
> **Status:** RATIFIED PRODUCTION VISUAL FOUNDATION (LOCKED)  

---

## 1. Production Motion Timing & Easing Curves

```css
/* Duration Tokens */
--duration-instant: 0ms;
--duration-fast: 100ms;    /* Key triggers, focus ring pop */
--duration-normal: 150ms;  /* Panel expansion, drawer slide */
--duration-slow: 250ms;    /* Modal overlay backdrop fade */

/* Easing Cubic-Bezier Curves */
--ease-out-cubic: cubic-bezier(0.33, 1, 0.68, 1);    /* Rapid exit & panel reveal */
--ease-in-out-cubic: cubic-bezier(0.65, 0, 0.35, 1); /* Smooth dialog transition */
```

---

## 2. Skeleton Shimmer & Loading Motion

Loading state skeletons use a low-contrast opacity pulse (`opacity: 0.4` to `opacity: 0.8` over `1200ms` infinite linear), avoiding distracting flashing.

---
