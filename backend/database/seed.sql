-- ============================================================
-- WAYRA — Seed Data: Rutas de Cochabamba
-- ============================================================

INSERT INTO public.routes (numero, name, origin, destination, price, security, stops, coordinates)
VALUES
(
    '101',
    'Terminal → Quillacollo',
    'Terminal de Buses',
    'Quillacollo',
    3.00,
    'alta',
    '["Terminal de Buses", "Av. Blanco Galindo Km 1", "Av. Blanco Galindo Km 3", "Av. Blanco Galindo Km 5", "Plaza Quillacollo"]',
    '[{"lat": -17.3942, "lng": -66.1570}, {"lat": -17.3900, "lng": -66.1900}, {"lat": -17.3880, "lng": -66.2100}, {"lat": -17.3860, "lng": -66.2300}, {"lat": -17.3850, "lng": -66.2800}]'
),
(
    '244',
    'Plaza → Cala Cala',
    'Plaza 14 de Septiembre',
    'Cala Cala',
    3.00,
    'alta',
    '["Plaza 14 de Septiembre", "Av. América", "Av. Uyuni", "Parque Lincoln", "Cala Cala"]',
    '[{"lat": -17.3895, "lng": -66.1568}, {"lat": -17.3850, "lng": -66.1600}, {"lat": -17.3820, "lng": -66.1650}, {"lat": -17.3790, "lng": -66.1700}, {"lat": -17.3750, "lng": -66.1780}]'
),
(
    '110',
    'UMSS → Cancha',
    'Universidad Mayor de San Simón',
    'La Cancha',
    2.00,
    'media',
    '["UMSS", "Av. Aniceto Arce", "Calle Sucre", "Mercado La Cancha"]',
    '[{"lat": -17.3940, "lng": -66.1470}, {"lat": -17.3920, "lng": -66.1490}, {"lat": -17.3910, "lng": -66.1520}, {"lat": -17.3970, "lng": -66.1600}]'
),
(
    '215',
    'Mayorazgo → Centro',
    'Mayorazgo',
    'Centro Histórico',
    3.00,
    'alta',
    '["Mayorazgo", "Av. Petrolera", "Av. Circunvalación", "Plaza Colón", "Plaza 14 de Septiembre"]',
    '[{"lat": -17.4100, "lng": -66.1400}, {"lat": -17.4050, "lng": -66.1450}, {"lat": -17.4000, "lng": -66.1500}, {"lat": -17.3920, "lng": -66.1550}, {"lat": -17.3895, "lng": -66.1568}]'
),
(
    '120',
    'Ticti → Colcapirhua',
    'Ticti Norte',
    'Colcapirhua',
    3.00,
    'media',
    '["Ticti Norte", "Av. Melchor Urquidi", "Av. Blanco Galindo Km 8", "Colcapirhua Centro"]',
    '[{"lat": -17.3600, "lng": -66.1680}, {"lat": -17.3650, "lng": -66.1900}, {"lat": -17.3700, "lng": -66.2200}, {"lat": -17.3720, "lng": -66.2600}]'
),
(
    '132',
    'Sacaba → Terminal',
    'Sacaba',
    'Terminal de Buses',
    3.00,
    'media',
    '["Sacaba Centro", "Av. Papa Paulo II", "Av. Tadeo Haenke", "Terminal de Buses"]',
    '[{"lat": -17.3980, "lng": -66.0500}, {"lat": -17.3960, "lng": -66.0800}, {"lat": -17.3950, "lng": -66.1100}, {"lat": -17.3942, "lng": -66.1570}]'
)
ON CONFLICT (numero) DO NOTHING;
