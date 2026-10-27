"use client"

import { motion } from "framer-motion";
const noise = (i: number, seed: number) => ((i * 7919 + seed * 104729) % 997) / 997;

export default function AntigravityBackground() {
    const particles = Array.from({ length: 25 })

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none bg-[#0a0c1a]">
            {/* Ambient Gradients */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[160px] -mr-[300px] -mt-[300px]" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[140px] -ml-[200px] -mb-[200px]" />
            
            {/* Floating Particles */}
            {particles.map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full bg-white/[0.03] border border-white/5"
                    style={{
                        width: noise(i, 1) * 200 + 40,
                        height: noise(i, 2) * 200 + 40,
                        left: `${noise(i, 3) * 100}%`,
                        top: `${noise(i, 4) * 100}%`,
                    }}
                    animate={{
                        y: [0, noise(i, 5) * -100 - 50, 0],
                        x: [0, noise(i, 6) * 50 - 25, 0],
                        scale: [1, 1.1, 1],
                        rotate: [0, 45, 0],
                    }}
                    transition={{
                        duration: noise(i, 7) * 15 + 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            ))}

            {/* Micro Particles */}
            {Array.from({ length: 40 }).map((_, i) => (
                <motion.div
                    key={`micro-${i}`}
                    className="absolute w-1 h-1 rounded-full bg-blue-400/20"
                    style={{
                        left: `${noise(i, 8) * 100}%`,
                        top: `${noise(i, 9) * 100}%`,
                    }}
                    animate={{
                        opacity: [0.1, 0.5, 0.1],
                        y: [0, -40, 0],
                    }}
                    transition={{
                        duration: noise(i, 10) * 5 + 3,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />
            ))}
        </div>
    )
}
