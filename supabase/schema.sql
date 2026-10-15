-- ============================================================
-- TrufiBot AI — Supabase Schema
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- Limpia tablas anteriores si existen
DROP TABLE IF EXISTS reportes CASCADE;
DROP TABLE IF EXISTS puntos_referencia CASCADE;
DROP TABLE IF EXISTS routes CASCADE;
DROP TABLE IF EXISTS tarifas CASCADE;

-- ------------------------------------------------------------
-- TARIFAS
-- ------------------------------------------------------------
CREATE TABLE tarifas (
  id SERIAL PRIMARY KEY,
  tipo_pasajero VARCHAR(50) NOT NULL,
  descripcion VARCHAR(150),
  precio_bs DECIMAL(4,2) NOT NULL,
  requisito VARCHAR(200)
);

INSERT INTO tarifas (tipo_pasajero, descripcion, precio_bs, requisito) VALUES
('adulto', 'Pasajero adulto general', 3.00, 'Sin requisito'),
('estudiante_universitario', 'Estudiante universitario', 2.00, 'Carnet universitario vigente'),
('estudiante_secundaria', 'Estudiante de colegio secundaria', 2.00, 'Carnet de estudiante vigente'),
('tercera_edad', 'Adulto mayor — tercera edad', 1.50, 'Carnet de identidad o reconocimiento del chofer'),
('nino_primaria', 'Niño en edad escolar primaria', 1.50, 'Uniforme de primaria o menor reconocible');

-- ------------------------------------------------------------
-- RUTAS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS routes (
  id SERIAL PRIMARY KEY,
  numero VARCHAR(10) NOT NULL,
  nombre VARCHAR(150),
  tipo VARCHAR(20) DEFAULT 'trufi',
  sindicato VARCHAR(150),
  origen VARCHAR(120),
  destino VARCHAR(120),
  recorrido_ida TEXT[],
  recorrido_vuelta TEXT[],
  calles_principales TEXT[],
  zonas TEXT[],
  precio_adulto DECIMAL(4,2) DEFAULT 3.00,
  precio_estudiante DECIMAL(4,2) DEFAULT 2.00,
  precio_tercera_edad DECIMAL(4,2) DEFAULT 1.50,
  precio_nino DECIMAL(4,2) DEFAULT 1.50,
  horario_inicio TIME,
  horario_fin TIME,
  frecuencia_min INT,
  seguridad VARCHAR(10) DEFAULT 'media',
  activo BOOLEAN DEFAULT TRUE,
  lat_origen DECIMAL(9,6),
  lng_origen DECIMAL(9,6),
  lat_destino DECIMAL(9,6),
  lng_destino DECIMAL(9,6),
  notas TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO routes (numero, nombre, tipo, sindicato, origen, destino, recorrido_ida, recorrido_vuelta, calles_principales, zonas, precio_adulto, precio_estudiante, precio_tercera_edad, precio_nino, horario_inicio, horario_fin, frecuencia_min, seguridad, lat_origen, lng_origen, lat_destino, lng_destino, notas) VALUES
('101','Trufi 101 — Ciudad del Niño / Tamborada','trufi','Sindicato Mixto de Transportistas 21 de Julio','Ciudad del Niño (Norte)','Tamborada (Sur)',
ARRAY['Ciudad del Niño','Av. Simón López','Calle Beijing','Av. Gabriel René Moreno','Puente Cobija','Av. Ayacucho','Plaza 14 de Septiembre','Av. Heroínas','Av. Aroma','Av. Panamericana','Río Bermejo','Av. Independencia','Tamborada'],
ARRAY['Tamborada','Av. Independencia','Río Bermejo','Av. Panamericana','Av. Aroma','Av. Heroínas','Calle Junín','Plaza 14 de Septiembre','Av. Ayacucho','Puente Cobija','Av. Gabriel René Moreno','Calle Beijing','Av. Simón López','Ciudad del Niño'],
ARRAY['Av. Simón López','Calle Beijing','Av. Ayacucho','Av. Heroínas','Av. Panamericana','Av. Independencia'],
ARRAY['norte','centro','sur','tamborada'],
3.00,2.00,1.50,1.50,'05:30','22:00',7,'alta',-17.3623,-66.1589,-17.4156,-66.1423,
'Una de las más grandes. El 1001 usa Calle Junín. Pasa por Plaza 14.'),

('110','Trufi 110 — Logustani / Portugal','trufi','Sindicato de Taxis y Trufis 14 de Septiembre','Torrentera Logustani (Norte)','Calle Portugal (Centro-Sur)',
ARRAY['Torrentera Logustani','Av. Tadeo Haenke','UMSS','Av. Oquendo','Plaza Colón','Av. Heroínas','Av. Aroma','Calle Portugal'],
ARRAY['Calle Portugal','Av. Aroma','Av. Heroínas','Plaza Colón','Av. Oquendo','UMSS','Av. Tadeo Haenke','Torrentera Logustani'],
ARRAY['Av. Tadeo Haenke','Av. Oquendo','Av. Heroínas','Av. Aroma'],
ARRAY['norte','umss','centro'],
3.00,2.00,1.50,1.50,'05:30','22:00',8,'alta',-17.3634,-66.1701,-17.3978,-66.1512,
'Pasa por la UMSS. Muy usado por estudiantes universitarios.'),

('120','Trufi 120 — Univalle / Tupac Katari','trufi','Sindicato Mixto Línea 120','Univalle entrada (Norte)','Calle Tupac Katari (Sur-Centro)',
ARRAY['Univalle entrada','Recoleta Alta','Av. Melchor Urquidi','Barrio Recoleta','Av. Ballivián (El Prado)','Plaza 14 de Septiembre','Av. Heroínas','Calle Tupac Katari'],
ARRAY['Calle Tupac Katari','Av. Heroínas','Plaza 14 de Septiembre','Av. Ballivián','Barrio Recoleta','Av. Melchor Urquidi','Recoleta Alta','Univalle entrada'],
ARRAY['Av. Melchor Urquidi','Av. Ballivián','Av. Heroínas'],
ARRAY['recoleta','norte','centro'],
3.00,2.00,1.50,1.50,'06:00','21:30',10,'alta',-17.3623,-66.1512,-17.3978,-66.1534,
'Pasa por El Prado y Plaza 14. Ideal para Recoleta.'),

('132','Trufi 132 — Arocagua / Av. Autonomía','trufi','Asociación de Taxi Trufis San Miguel','Torrentera Arocagua Mayu (Sacaba)','Avenida Autonomía (Centro)',
ARRAY['Torrentera Arocagua Mayu','Sacaba Este','Sacaba Centro Plaza Principal','Hipódromo','Av. 6 de Agosto','Av. Tadeo Haenke','Plaza Colón','Av. Heroínas','Plaza 14 de Septiembre','Av. Autonomía'],
ARRAY['Av. Autonomía','Plaza 14 de Septiembre','Av. Heroínas','Plaza Colón','Av. Tadeo Haenke','Av. 6 de Agosto','Hipódromo','Sacaba Centro','Sacaba Este','Torrentera Arocagua Mayu'],
ARRAY['Av. 6 de Agosto','Av. Tadeo Haenke','Av. Heroínas','Av. Autonomía'],
ARRAY['sacaba','hipódromo','centro'],
3.00,2.00,1.50,1.50,'05:00','22:00',10,'media',-17.3734,-66.0845,-17.3845,-66.1712,
'Sacaba Este al centro. Pasa por el Hipódromo.'),

('134','Trufi 134 — Chiquicollo / Circunvalación','trufi','Sindicato 30 de Noviembre','Avenida Chiquicollo (Sur)','Avenida Circunvalación',
ARRAY['Av. Chiquicollo','Zona Sur','Av. Melchor Pérez de Olguín','Barrio Cala Cala','Av. Circunvalación Beijing','Av. Circunvalación'],
ARRAY['Av. Circunvalación','Av. Circunvalación Beijing','Barrio Cala Cala','Av. Melchor Pérez de Olguín','Zona Sur','Av. Chiquicollo'],
ARRAY['Av. Chiquicollo','Av. Melchor Pérez de Olguín','Av. Circunvalación'],
ARRAY['sur','cala_cala','circunvalacion'],
3.00,2.00,1.50,1.50,'05:30','21:30',12,'media',-17.4089,-66.1701,-17.3734,-66.1345,
'Zona sur y Cala Cala hacia la Circunvalación.'),

('150','Trufi 150 — Univalle / Av. República','trufi','Sindicato 15 de Abril','Univalle entrada (Norte)','Avenida República (Centro)',
ARRAY['Univalle entrada','Recoleta Alta','Av. Melchor Urquidi','Barrio Recoleta','Av. América','Av. República'],
ARRAY['Av. República','Av. América','Barrio Recoleta','Av. Melchor Urquidi','Recoleta Alta','Univalle entrada'],
ARRAY['Av. Melchor Urquidi','Av. América','Av. República'],
ARRAY['recoleta','norte','centro'],
3.00,2.00,1.50,1.50,'06:00','21:30',12,'alta',-17.3623,-66.1512,-17.3934,-66.1578,
'Recoleta y Av. América. Zona residencial segura.'),

('200','Micro 200 — Centro / Quillacollo','micro','Sindicato Mixto Línea 7 Nuestra Señora de Urkupiña','Calle Litoral (Centro)','Quillacollo Plaza Bolívar',
ARRAY['Calle Litoral','Av. Blanco Galindo','Av. Perú','Calancha','Av. Uyuni','Barrio Recoleta','Calle Papa Paulo','Belzu','Calle 9 de Abril','Colcapirhua','Quillacollo Plaza Bolívar'],
ARRAY['Quillacollo Plaza Bolívar','Colcapirhua','Calle 9 de Abril','Belzu','Calle Papa Paulo','Barrio Recoleta','Av. Uyuni','Calancha','Av. Perú','Av. Blanco Galindo','Calle Litoral'],
ARRAY['Av. Blanco Galindo','Av. Perú','Av. Uyuni','Belzu'],
ARRAY['centro','recoleta','oeste','colcapirhua','quillacollo'],
3.00,2.00,1.50,1.50,'05:00','22:30',8,'media',-17.3912,-66.1534,-17.3934,-66.2189,
'RUTA PRINCIPAL a Quillacollo. Microbús mayor capacidad.'),

('212','Micro 212 — Centro / Sacaba Molino Blanco','micro','Sindicato Mixto Transportistas Santa Rosa de Lima','Calle Acre (Centro)','Molino Blanco (Sacaba)',
ARRAY['Calle Acre','Av. Ayacucho','Av. 6 de Agosto','Hipódromo','Sacaba Centro Plaza Principal','Av. Eliodoro Villazón','Molino Blanco'],
ARRAY['Molino Blanco','Av. Eliodoro Villazón','Sacaba Centro Plaza Principal','Hipódromo','Av. 6 de Agosto','Av. Ayacucho','Calle Acre'],
ARRAY['Av. Ayacucho','Av. 6 de Agosto','Av. Eliodoro Villazón'],
ARRAY['centro','este','sacaba','molino_blanco'],
3.00,2.00,1.50,1.50,'05:00','22:00',8,'media',-17.3912,-66.1567,-17.3689,-66.0756,
'RUTA PRINCIPAL a Sacaba Molino Blanco.'),

('244','Trufi 244 — Paucarpata / Sacaba Villazón','trufi','Sindicato Mixto Transportistas Santa Rosa de Lima','Calle Paucarpata (Centro)','Av. Eliodoro Villazón (Sacaba)',
ARRAY['Calle Paucarpata','Av. Ayacucho','Plaza 14 de Septiembre','Av. Heroínas','Av. 6 de Agosto','Hipódromo','Sacaba Centro Plaza Principal','Av. Eliodoro Villazón'],
ARRAY['Av. Eliodoro Villazón','Sacaba Centro Plaza Principal','Hipódromo','Av. 6 de Agosto','Av. Heroínas','Plaza 14 de Septiembre','Av. Ayacucho','Calle Paucarpata'],
ARRAY['Av. Ayacucho','Av. Heroínas','Av. 6 de Agosto','Av. Eliodoro Villazón'],
ARRAY['centro','este','sacaba'],
3.00,2.00,1.50,1.50,'05:30','22:00',10,'media',-17.3923,-66.1578,-17.3756,-66.0934,
'Centro a Sacaba. Pasa por Plaza 14 e Hipódromo.'),

('250','Trufi 250 — Centro / Tiquipaya','trufi','Sindicato Mixto Transportes Tiquipaya','Av. Blanco Galindo (Centro)','Av. Mártires de la Democracia (Tiquipaya)',
ARRAY['Av. Blanco Galindo','Centro Cochabamba','Quillacollo cruce','Colcapirhua','Tiquipaya Centro','Av. Mártires de la Democracia'],
ARRAY['Av. Mártires de la Democracia','Tiquipaya Centro','Colcapirhua','Quillacollo cruce','Centro Cochabamba','Av. Blanco Galindo'],
ARRAY['Av. Blanco Galindo','Av. Mártires de la Democracia'],
ARRAY['centro','colcapirhua','tiquipaya','noroeste'],
3.00,2.00,1.50,1.50,'05:30','22:00',15,'alta',-17.3895,-66.1568,-17.3512,-66.2289,
'Llega hasta Tiquipaya. Zona residencial tranquila.'),

('260','Trufi 260 — Centro / Sipe Sipe','trufi','Sindicato Mixto Autotransporte 6 de Agosto Sipe Sipe','Calle Litoral (Centro)','Av. Blanco Galindo (Sipe Sipe)',
ARRAY['Calle Litoral','Av. Blanco Galindo','Quillacollo','Vinto','Sipe Sipe'],
ARRAY['Sipe Sipe','Vinto','Quillacollo','Av. Blanco Galindo','Calle Litoral'],
ARRAY['Av. Blanco Galindo'],
ARRAY['centro','quillacollo','vinto','sipe_sipe'],
3.00,2.00,1.50,1.50,'05:00','21:00',20,'media',-17.3912,-66.1534,-17.4123,-66.2845,
'Ruta larga a Sipe Sipe. Sale menos frecuente.');

-- ------------------------------------------------------------
-- PUNTOS DE REFERENCIA
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS puntos_referencia (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  alias TEXT[],
  zona VARCHAR(50),
  lat DECIMAL(9,6),
  lng DECIMAL(9,6),
  tipo VARCHAR(30)
);

INSERT INTO puntos_referencia (nombre, alias, zona, lat, lng, tipo) VALUES
('Plaza 14 de Septiembre',ARRAY['Plaza Principal','Plaza Central','la plaza','plaza 14'],'centro',-17.3895,-66.1568,'plaza'),
('UMSS',ARRAY['Universidad Mayor de San Simón','la U','universidad','San Simón'],'norte',-17.3712,-66.1589,'universidad'),
('La Cancha',ARRAY['Cancha Central','el mercado','la feria','mercado','cancha'],'centro',-17.3965,-66.1612,'mercado'),
('Terminal de Buses',ARRAY['Terminal','la terminal','buses'],'sur',-17.4023,-66.1534,'terminal'),
('Av. El Prado',ARRAY['El Prado','Ballivián','el boulevard','prado'],'centro',-17.3831,-66.1547,'avenida'),
('Barrio Recoleta',ARRAY['Recoleta','la recoleta','zona recoleta'],'norte',-17.3734,-66.1489,'barrio'),
('Barrio Cala Cala',ARRAY['Cala Cala','cala cala'],'norte',-17.3698,-66.1423,'barrio'),
('Quillacollo',ARRAY['Quillacollo','quillacollo centro','plaza quillacollo'],'oeste',-17.3934,-66.2189,'municipio'),
('Sacaba',ARRAY['Sacaba','sacaba centro','plaza sacaba'],'este',-17.3756,-66.0892,'municipio'),
('Univalle',ARRAY['Univalle','universidad del valle'],'norte',-17.3623,-66.1512,'universidad'),
('Hospital Viedma',ARRAY['Viedma','el hospital'],'sur',-17.4012,-66.1578,'hospital'),
('Hipódromo',ARRAY['Hipódromo','hipodromo'],'este',-17.3789,-66.1134,'recreacion'),
('Av. América',ARRAY['Av. América','la america'],'centro',-17.3923,-66.1534,'avenida'),
('Tiquipaya',ARRAY['Tiquipaya','tiquipaya centro'],'noroeste',-17.3512,-66.2289,'municipio'),
('Colcapirhua',ARRAY['Colcapirhua','colcapirhua centro'],'oeste',-17.3834,-66.2045,'municipio'),
('Plaza Colón',ARRAY['Plaza Colón','colon'],'norte_centro',-17.3812,-66.1601,'plaza'),
('Av. Circunvalación',ARRAY['Circunvalación','la circunvalacion'],'este',-17.3734,-66.1389,'avenida'),
('Cristo de la Concordia',ARRAY['El Cristo','cristo','cerro san pedro','teleférico'],'este',-17.3912,-66.1123,'monumento'),
('Ciudad del Niño',ARRAY['Ciudad del Niño','ciudad del niño'],'norte',-17.3623,-66.1589,'barrio'),
('Tamborada',ARRAY['Tamborada','zona tamborada'],'sur',-17.4156,-66.1423,'barrio'),
('Av. Blanco Galindo',ARRAY['Blanco Galindo','la blanco galindo'],'oeste',-17.3895,-66.1890,'avenida'),
('Sacaba Molino Blanco',ARRAY['Molino Blanco','molino blanco'],'este',-17.3689,-66.0756,'barrio'),
('Valle Hermoso',ARRAY['Valle Hermoso','valle hermoso'],'norte',-17.3578,-66.1556,'barrio'),
('Vinto',ARRAY['Vinto','vinto centro'],'oeste',-17.4012,-66.2456,'municipio'),
('Sipe Sipe',ARRAY['Sipe Sipe','sipe sipe'],'oeste',-17.4123,-66.2845,'municipio');

-- ------------------------------------------------------------
-- REPORTES CIUDADANOS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reportes (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(30),
  descripcion TEXT,
  zona VARCHAR(100),
  ruta_afectada VARCHAR(20),
  lat DECIMAL(9,6),
  lng DECIMAL(9,6),
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ------------------------------------------------------------
-- RLS POLICIES
-- Ejecutar DESPUÉS del primer bloque (create + insert)
-- ------------------------------------------------------------

-- tarifas: lectura pública
ALTER TABLE tarifas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tarifas_public_read" ON tarifas FOR SELECT USING (true);

-- routes: lectura pública
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "routes_public_read" ON routes FOR SELECT USING (true);

-- puntos_referencia: lectura pública
ALTER TABLE puntos_referencia ENABLE ROW LEVEL SECURITY;
CREATE POLICY "puntos_public_read" ON puntos_referencia FOR SELECT USING (true);

-- reportes: cualquiera puede insertar, solo lectura de activos
ALTER TABLE reportes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reportes_public_insert" ON reportes FOR INSERT WITH CHECK (true);
CREATE POLICY "reportes_public_read" ON reportes FOR SELECT USING (activo = true);
