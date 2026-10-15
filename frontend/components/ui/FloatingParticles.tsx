const PARTICLES = [
  { size: 80,  left: '8%',  top: '18%', delay: '0s',   duration: '6s'   },
  { size: 50,  left: '84%', top: '12%', delay: '1.2s', duration: '8s'   },
  { size: 110, left: '68%', top: '62%', delay: '2s',   duration: '7s'   },
  { size: 40,  left: '22%', top: '72%', delay: '0.6s', duration: '9s'   },
  { size: 65,  left: '48%', top: '8%',  delay: '1.8s', duration: '5.5s' },
  { size: 30,  left: '32%', top: '88%', delay: '3.2s', duration: '6.5s' },
  { size: 90,  left: '90%', top: '44%', delay: '2.6s', duration: '7.5s' },
  { size: 45,  left: '4%',  top: '52%', delay: '4s',   duration: '8.5s' },
]

export default function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white/8 animate-float"
          style={{
            width: p.size,
            height: p.size,
            left: p.left,
            top: p.top,
            animationDelay: p.delay,
            animationDuration: p.duration,
            background: 'rgba(255,255,255,0.08)',
          }}
        />
      ))}
    </div>
  )
}
