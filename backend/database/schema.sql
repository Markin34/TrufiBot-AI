-- ============================================================
-- WAYRA — Schema SQL para Supabase (idempotente)
-- ============================================================

-- Extensión para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Limpiar políticas existentes (una por una para aislar errores) ─
DO $$ BEGIN DROP POLICY IF EXISTS profiles_select      ON public.profiles;      EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS profiles_update_own  ON public.profiles;      EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS profiles_insert      ON public.profiles;      EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS routes_select        ON public.routes;        EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS routes_all_service   ON public.routes;        EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS reports_select       ON public.reports;       EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS reports_insert       ON public.reports;       EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS favorites_own        ON public.favorites;     EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS trips_own            ON public.trips;         EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS driver_status_select ON public.driver_status; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS driver_status_own    ON public.driver_status; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS chat_usage_own       ON public.chat_daily_usage; EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ─── Tabla: profiles ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email       TEXT NOT NULL,
    full_name   TEXT,
    role        TEXT NOT NULL DEFAULT 'pasajero' CHECK (role IN ('pasajero', 'chofer', 'admin')),
    avatar_url  TEXT,
    phone       TEXT,
    is_active   BOOLEAN DEFAULT TRUE,
    approved    BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Plan (columnas añadidas de forma idempotente)
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS plan             TEXT DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
    ADD COLUMN IF NOT EXISTS plan_expires_at  TIMESTAMPTZ;

-- ─── Tabla: routes ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.routes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero          TEXT NOT NULL UNIQUE,
    name            TEXT NOT NULL,
    origin          TEXT NOT NULL,
    destination     TEXT NOT NULL,
    price           NUMERIC(4,2) NOT NULL,
    security        TEXT NOT NULL DEFAULT 'media' CHECK (security IN ('alta', 'media', 'baja')),
    stops           JSONB DEFAULT '[]',
    coordinates     JSONB DEFAULT '[]',
    active          BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Tabla: reports ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reports (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    route_id        UUID REFERENCES public.routes(id) ON DELETE SET NULL,
    type            TEXT NOT NULL CHECK (type IN ('accidente', 'retraso', 'superpoblado', 'desvio', 'otro')),
    description     TEXT NOT NULL,
    location_lat    NUMERIC(10,7),
    location_lng    NUMERIC(10,7),
    status          TEXT DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'revisado', 'eliminado')),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Tabla: favorites ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.favorites (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    route_id    UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
    alias       TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, route_id)
);

-- ─── Tabla: trips ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.trips (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    route_id        UUID REFERENCES public.routes(id) ON DELETE SET NULL,
    origin          TEXT,
    destination     TEXT,
    rating          INTEGER CHECK (rating BETWEEN 1 AND 5),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Tabla: driver_status ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.driver_status (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    route_id        UUID REFERENCES public.routes(id) ON DELETE SET NULL,
    status          TEXT DEFAULT 'fuera_de_servicio' CHECK (status IN ('disponible', 'ocupado', 'fuera_de_servicio')),
    latitude        NUMERIC(10,7),
    longitude       NUMERIC(10,7),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(driver_id)
);

-- ─── Tabla: chat_daily_usage ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.chat_daily_usage (
    user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    date        DATE DEFAULT CURRENT_DATE,
    count       INTEGER DEFAULT 0,
    PRIMARY KEY (user_id, date)
);

-- ─── RLS (Row Level Security) ───────────────────────────────
ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_status ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_select"      ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own"  ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert"      ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Routes: lectura pública, escritura via service_role del backend
CREATE POLICY "routes_select"        ON public.routes FOR SELECT USING (true);
CREATE POLICY "routes_all_service"   ON public.routes USING (true) WITH CHECK (true);

-- Reports
CREATE POLICY "reports_select"       ON public.reports FOR SELECT USING (true);
CREATE POLICY "reports_insert"       ON public.reports FOR INSERT WITH CHECK (
    user_id IS NULL OR auth.uid() = user_id
);

-- Favorites: solo el dueño
CREATE POLICY "favorites_own"        ON public.favorites USING (auth.uid() = user_id);

-- Trips: solo el dueño
CREATE POLICY "trips_own"            ON public.trips USING (auth.uid() = user_id);

-- Driver status
CREATE POLICY "driver_status_select" ON public.driver_status FOR SELECT USING (true);
CREATE POLICY "driver_status_own"    ON public.driver_status FOR ALL USING (auth.uid() = driver_id);

-- Chat daily usage: solo el propio usuario
ALTER TABLE public.chat_daily_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "chat_usage_own" ON public.chat_daily_usage USING (auth.uid() = user_id);

-- ─── Función: auto-crear profile al registrarse ─────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'pasajero')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger (re-crear si ya existe)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
