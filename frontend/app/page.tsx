'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Zap, Shield, MapPin, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import Header from '@/components/ui/Header'
import SearchForm from '@/components/ui/SearchForm'
import CountUp from '@/components/ui/CountUp'
import FloatingParticles from '@/components/ui/FloatingParticles'

const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-red-800 flex items-center justify-center">
      <div className="text-white/60 text-sm">Cargando mapa...</div>
    </div>
  ),
})

const FEATURES = [
  { icon: Zap,    title: 'IA en segundos',  desc: 'Respuestas instantáneas con Claude AI para encontrar tu ruta' },
  { icon: Shield, title: 'Rutas seguras',    desc: 'Modo nocturno con alertas de seguridad actualizadas' },
  { icon: MapPin, title: 'Mapa en vivo',     desc: 'Visualiza rutas y paradas en mapa interactivo de Cochabamba' },
  { icon: Star,   title: 'Guarda favoritos', desc: 'Registra tus rutas más usadas para acceso rápido' },
]

const STATS = [
  { label: 'Rutas activas',      value: 6,   suffix: '+' },
  { label: 'Zonas cubiertas',    value: 12,  suffix: ''  },
  { label: 'Usuarios activos',   value: 500, suffix: '+' },
  { label: 'Reportes resueltos', value: 98,  suffix: '%' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Header />

      {/* ── Hero ── */}
      <section className="bg-trufi-gradient relative overflow-hidden">
        <FloatingParticles />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-10 items-center">

            {/* Left — staggered entrance */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-white/30"
              >
                <span className="w-1.5 h-1.5 bg-red-300 rounded-full animate-pulse" />
                El primer asistente de movilidad para Cochabamba
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
                className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4"
              >
                Encuentra tu trufi<br />
                <span className="text-red-200">con inteligencia artificial</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
                className="text-red-100 text-lg mb-8 leading-relaxed"
              >
                WAYRA te dice exactamente qué trufi tomar, cuánto cuesta,
                cuánto esperar y las paradas — todo en segundos.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45, ease: 'easeOut' }}
              >
                <SearchForm />
              </motion.div>
            </div>

            {/* Map — slides in from right */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.75, delay: 0.3, ease: 'easeOut' }}
              className="hidden lg:block h-96 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/30"
            >
              <LeafletMap zoom={13} showLiveTrufis />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {STATS.map(({ label, value, suffix }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-extrabold text-red-600 mb-1">
                  <CountUp to={value} suffix={suffix} />
                </div>
                <div className="text-sm text-gray-500 mb-2">{label}</div>
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.1 + 0.3 }}
                  className="h-0.5 bg-red-300 mx-auto w-8"
                  style={{ originX: 0 }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
            Todo lo que necesitas para moverte
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            WAYRA combina IA avanzada con datos locales de Cochabamba para darte las mejores rutas.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-red-100 transition-shadow cursor-default group"
            >
              <motion.div
                whileHover={{ rotate: 15, scale: 1.15 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                className="w-12 h-12 bg-red-50 group-hover:bg-red-100 rounded-2xl flex items-center justify-center mb-4 transition-colors"
              >
                <Icon className="w-6 h-6 text-red-600" />
              </motion.div>
              <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-trufi-gradient py-16 text-center relative overflow-hidden">
        {/* Partículas flotantes de fondo */}
        <FloatingParticles />

        {/* Buses animados cruzando la pantalla */}
        {[
          { top: '18%', duration: '9s',  delay: '0s',   size: '2rem', opacity: 0.18 },
          { top: '42%', duration: '13s', delay: '3.5s', size: '1.5rem', opacity: 0.13 },
          { top: '68%', duration: '10s', delay: '1.8s', size: '2.4rem', opacity: 0.20 },
          { top: '82%', duration: '16s', delay: '6s',   size: '1.2rem', opacity: 0.10 },
          { top: '30%', duration: '11s', delay: '8s',   size: '1.8rem', opacity: 0.15 },
        ].map((b, i) => (
          <div
            key={i}
            aria-hidden
            className="animate-bus-drive pointer-events-none absolute select-none"
            style={{
              top: b.top,
              fontSize: b.size,
              opacity: b.opacity,
              animationDuration: b.duration,
              animationDelay: b.delay,
            }}
          >
            <span style={{ display: 'inline-block', transform: 'scaleX(-1)' }}>🚐</span>
          </div>
        ))}

        <div className="relative z-10 max-w-2xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-extrabold text-white mb-4">
              ¿Listo para moverte más inteligente?
            </h2>
            <p className="text-red-100 mb-8">
              Únete a cientos de cochabambinos que ya usan WAYRA cada día.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/auth/register"
                className="bg-white text-red-700 font-bold px-8 py-3 rounded-xl hover:bg-red-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 animate-glow"
              >
                Crear cuenta gratis
              </Link>
              <Link
                href="/chat"
                className="border border-white/40 text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/10 transition-all duration-200 hover:-translate-y-0.5"
              >
                Probar sin registrarse
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-gray-400 text-center py-6 text-sm">
        <p>Hecho por el mejor grupo &quot;SMILING FRIENDS&quot; SEMANAe</p>
      </footer>
    </div>
  )
}
