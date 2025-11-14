# Learnings

### delayedRender() function implements the classic Suspense Resource pattern:

    1. resource.read() throws a promise when not ready.
    2. React catches it, pauses rendering, and shows the <Suspense> fallback.
    3. Once the promise resolves, React retries and the component renders normally.

This is exactly how data fetching libraries like React Query, Relay, or the new React Server Components work internally.

### Map cache prevents infinite suspense loops

Map cache ensures:

    1. The same `count` value doesn't trigger Suspense again.
    2. Suspense only happens on the first access of each value.

Without caching, resource.read() would always throw, causing React to infinitely fallback.

### What Transitions actually mean

Normal update (high priority):

    1. React re-renders synchronously
    2. Suspense fallback flashes immendiately

Transition update (low priority):

    1. The UI stays responsive
    2. React keeps showing the old UI until the async task (delayed resource) is ready
    3. The Suspense fallback appears only for the transition.

Transitions tell React which updates are not urgent, so it can delay them without blocking the UI.

### How isPending works

isPending !== Suspense fallback
These two things are related but independent.

It helps us show: spinners, disable buttons, show optimistic UI, avoid flickering fallbacks etc.

### Suspense works per-render, not per-component

`{!isPending && <CountDisplay count={count} />}`

If you remove the !isPending check, Suspense takes over:

    1. CountDisplay suspends
    2. The <Suspense> fallback renders
    3. Then React retries.

This is how to control when a component is allowed to suspend.

### "Source of truth" vs "UI representation"

`count`: Model state (e.g., form data, fast and local)
`displayedCount`: Rendered state (e.g., fetched data that may suspend)

This is exactly how:

    1. autocomplete inputs
    2. search results pages
    3. charts
    4. dashboards

handle transistions + data loaders.

### Small visualization of React's scheduler

There were 3 possible UI states:

    1. normal update -> component re-renders instantly (#renders = 1)
    2. transition but resource ready -> component re-renders, no fallback (#renders = 2)
    3. transition & resource pending -> Suspense fallback + isPending (#renders = 3)

### How throwing promises replaces manual fetching logic

Resource's `read()` method teaches us:

    1. we don't need a `loading` boolean
    2. we don't need `useEffect`
    3. we don't need `useState` for async data

This mental model is key for understanding:

    1. New data APIs in React 18
    2. Server Components
    3. Frameworks like Next.js App Router
    4. Streaming SSR
    5. React Query v5 Suspense mode

## Takeaways

    ⭐ Suspense is not a loading state — it’s a rendering delay mechanism
    ⭐ Transitions mark updates as low-priority, so UI remains responsive
    ⭐ startTransition + Suspense makes async UI smooth by avoiding blocking
    ⭐ Throwing promises is fundamental to Suspense’s design
    ⭐ Caching is essential to avoid infinite suspensions
    ⭐ isPending is not the same as Suspense fallback—both have distinct roles

## Why does React do 3 renders during a Suspense transition?

Because Suspense has two distinct UI states:

    1. The initial attempt → Render 1
        React tries to render but hits suspension.
    2. Fallback UI → Render 2
        Suspense inserts fallback UI to keep your app responsive.
    3. Retry after promise resolves → Render 3
        React commits the real UI now that the data is available.
