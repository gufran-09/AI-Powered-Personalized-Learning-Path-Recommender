import { useState, useEffect, useRef } from 'react'

export function useCountUp(end, duration = 2000, startOnMount = true) {
    const [count, setCount] = useState(0)
    const [started, setStarted] = useState(startOnMount)
    const rafRef = useRef(null)

    // Sync started state when the external trigger changes (e.g. isInView goes true)
    useEffect(() => {
        if (startOnMount) setStarted(true)
    }, [startOnMount])

    useEffect(() => {
        if (!started) return
        if (end === 0) { setCount(0); return }
        let startTime = null

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp
            const progress = Math.min((timestamp - startTime) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * end))

            if (progress < 1) {
                rafRef.current = requestAnimationFrame(animate)
            }
        }

        rafRef.current = requestAnimationFrame(animate)
        return () => cancelAnimationFrame(rafRef.current)
    }, [end, duration, started])

    return { count, start: () => setStarted(true) }
}

export function useInView(options = {}) {
    const ref = useRef(null)
    const [isInView, setIsInView] = useState(false)

    useEffect(() => {
        const element = ref.current
        if (!element) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true)
                    if (options.once !== false) observer.unobserve(element)
                }
            },
            { threshold: options.threshold || 0.1 }
        )

        observer.observe(element)
        return () => observer.disconnect()
    }, [options.once, options.threshold])

    return { ref, isInView }
}

export function useLocalStorage(key, initialValue) {
    const [value, setValue] = useState(() => {
        try {
            const item = localStorage.getItem(key)
            return item ? JSON.parse(item) : initialValue
        } catch {
            return initialValue
        }
    })

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value))
    }, [key, value])

    return [value, setValue]
}
