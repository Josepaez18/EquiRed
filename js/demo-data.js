// ============================================
// EquiRed - Datos de Demostración
// ============================================
// Se usan cuando la API PHP no está disponible
// (ej. deploy en Vercel sin backend)
// ============================================

const DEMO_DATA = {
    // ---- Empleos ----
    empleos: [
        {
            id: 1,
            titulo: 'Desarrollador/a Web Junior',
            descripcion: 'Buscamos un/a desarrollador/a web con conocimientos en HTML, CSS y JavaScript para unirse a nuestro equipo inclusivo. Se valora la diversidad y el compromiso social.',
            empresa_nombre: 'TechInclusion SAS',
            ubicacion: 'Bogotá, Colombia (Remoto)',
            tipo_contrato: 'Tiempo completo',
            salario: '$2.500.000 - $3.500.000 COP',
            requisitos: 'HTML, CSS, JavaScript, Git',
            fecha_publicacion: new Date(Date.now() - 2 * 86400000).toISOString()
        },
        {
            id: 2,
            titulo: 'Asistente Administrativo/a',
            descripcion: 'Empresa comprometida con la igualdad busca asistente administrativo/a. Ofrecemos ambiente laboral inclusivo y horarios flexibles para personas con responsabilidades de cuidado.',
            empresa_nombre: 'Fundación EquiSocial',
            ubicacion: 'Medellín, Colombia',
            tipo_contrato: 'Medio tiempo',
            salario: '$1.200.000 - $1.800.000 COP',
            requisitos: 'Office, organización, comunicación',
            fecha_publicacion: new Date(Date.now() - 5 * 86400000).toISOString()
        },
        {
            id: 3,
            titulo: 'Diseñador/a Gráfico/a Freelance',
            descripcion: 'Buscamos diseñador/a gráfico/a para crear material visual de campañas de inclusión social. Proyectos con impacto positivo en comunidades vulnerables.',
            empresa_nombre: 'ONG Puentes de Igualdad',
            ubicacion: 'Remoto - Colombia',
            tipo_contrato: 'Freelance',
            salario: '$50.000 - $80.000 COP/hora',
            requisitos: 'Illustrator, Photoshop, Figma',
            fecha_publicacion: new Date(Date.now() - 1 * 86400000).toISOString()
        },
        {
            id: 4,
            titulo: 'Coordinador/a de Proyectos Sociales',
            descripcion: 'Buscamos profesional para coordinar proyectos de reducción de desigualdades en comunidades rurales. Experiencia en trabajo comunitario es un plus.',
            empresa_nombre: 'Diversa Colombia',
            ubicacion: 'Cali, Colombia',
            tipo_contrato: 'Tiempo completo',
            salario: '$3.000.000 - $4.000.000 COP',
            requisitos: 'Gestión de proyectos, trabajo comunitario',
            fecha_publicacion: new Date(Date.now() - 3 * 86400000).toISOString()
        },
        {
            id: 5,
            titulo: 'Practicante de Comunicación Social',
            descripcion: 'Oportunidad de prácticas en el área de comunicación para campañas de sensibilización sobre el ODS 10. Ideal para estudiantes universitarios.',
            empresa_nombre: 'Red Inclusiva',
            ubicacion: 'Barranquilla, Colombia',
            tipo_contrato: 'Prácticas',
            salario: 'SMLV + auxilio de transporte',
            requisitos: 'Estudiante de comunicación, redes sociales',
            fecha_publicacion: new Date(Date.now() - 7 * 86400000).toISOString()
        },
        {
            id: 6,
            titulo: 'Analista de Datos para Impacto Social',
            descripcion: 'Se requiere analista de datos para medir el impacto de programas sociales en poblaciones vulnerables. Trabajo con propósito y enfoque en reducir desigualdades.',
            empresa_nombre: 'DataPaz',
            ubicacion: 'Bogotá, Colombia (Híbrido)',
            tipo_contrato: 'Tiempo completo',
            salario: '$3.500.000 - $5.000.000 COP',
            requisitos: 'Python, Excel avanzado, Power BI',
            fecha_publicacion: new Date(Date.now() - 4 * 86400000).toISOString()
        }
    ],

    // ---- Publicaciones del feed ----
    publicaciones: [
        {
            id: 1,
            contenido: '¡Hoy fue mi primer día en mi nuevo trabajo! Gracias a EquiRed encontré una empresa que valora la diversidad. Nunca pensé que alguien como yo tendría esta oportunidad. ¡Sí se puede! 💪✨',
            autor_nombre: 'María García',
            autor_tipo: 'beneficiario',
            fecha_creacion: new Date(Date.now() - 3600000).toISOString(),
            total_likes: 24,
            total_comentarios: 5,
            user_liked: false,
            imagen_url: null,
            comentarios: [
                { autor_nombre: 'Carlos Ruiz', contenido: '¡Felicidades María! Te lo mereces 🎉' },
                { autor_nombre: 'Ana López', contenido: 'Qué inspirador, me motiva a seguir buscando.' }
            ]
        },
        {
            id: 2,
            contenido: 'En nuestra empresa creemos que la diversidad nos hace más fuertes. Hoy publicamos 3 nuevas vacantes inclusivas en EquiRed. ¡Todos son bienvenidos a postularse! #EmpleoInclusivo #ODS10',
            autor_nombre: 'TechInclusion SAS',
            autor_tipo: 'empresa',
            fecha_creacion: new Date(Date.now() - 7200000).toISOString(),
            total_likes: 18,
            total_comentarios: 3,
            user_liked: false,
            imagen_url: null,
            comentarios: [
                { autor_nombre: 'Pedro Martínez', contenido: '¡Excelente iniciativa! Ya me postulé.' }
            ]
        },
        {
            id: 3,
            contenido: 'Como psicóloga especializada en inclusión, quiero recordarles que la discriminación afecta la salud mental. Si estás pasando por una situación difícil, no dudes en pedir ayuda. Estoy aquí para apoyarte a través de EquiRed. 🧠💚',
            autor_nombre: 'Dra. Laura Sánchez',
            autor_tipo: 'profesional',
            fecha_creacion: new Date(Date.now() - 18000000).toISOString(),
            total_likes: 42,
            total_comentarios: 8,
            user_liked: false,
            imagen_url: null,
            comentarios: [
                { autor_nombre: 'Juliana Pérez', contenido: 'Gracias por su labor, Dra. Sánchez. Es muy valiosa.' },
                { autor_nombre: 'Roberto Díaz', contenido: 'Necesitamos más profesionales como usted.' }
            ]
        },
        {
            id: 4,
            contenido: 'Hoy hice mi primera donación en EquiRed. No es mucho, pero sé que cada peso cuenta para reducir la desigualdad en nuestro país. Los invito a todos a aportar lo que puedan. 💝',
            autor_nombre: 'Andrés Morales',
            autor_tipo: 'donante',
            fecha_creacion: new Date(Date.now() - 43200000).toISOString(),
            total_likes: 31,
            total_comentarios: 4,
            user_liked: false,
            imagen_url: null,
            comentarios: []
        },
        {
            id: 5,
            contenido: 'Quiero compartir mi historia: hace un año era víctima de discriminación laboral por mi condición. Hoy, gracias a la asesoría jurídica que recibí a través de EquiRed, pude hacer valer mis derechos. La plataforma realmente cambia vidas. ⚖️',
            autor_nombre: 'Santiago Herrera',
            autor_tipo: 'beneficiario',
            fecha_creacion: new Date(Date.now() - 86400000).toISOString(),
            total_likes: 56,
            total_comentarios: 12,
            user_liked: false,
            imagen_url: null,
            comentarios: [
                { autor_nombre: 'Valentina Torres', contenido: 'Tu historia es muy poderosa, Santiago. ¡Gracias por compartirla!' },
                { autor_nombre: 'Dra. Laura Sánchez', contenido: 'Me alegra mucho saber que pudimos ayudarte.' }
            ]
        }
    ],

    // ---- Donaciones ----
    donaciones_stats: {
        total_monto: 15750000,
        total_donaciones: 234,
        total_donantes: 89,
        recientes: [
            { donante_nombre: 'Andrés Morales', monto: 50000, mensaje: 'Para un mundo más justo' },
            { donante_nombre: 'Lucía Fernández', monto: 100000, mensaje: 'Apoyo a la inclusión social' },
            { donante_nombre: 'Carlos Ruiz', monto: 25000, mensaje: 'Donación solidaria' },
            { donante_nombre: 'Ana López', monto: 75000, mensaje: 'Por la igualdad de oportunidades' },
            { donante_nombre: 'TechInclusion SAS', monto: 500000, mensaje: 'Responsabilidad social empresarial' }
        ]
    },

    // ---- Profesionales para asesorías ----
    profesionales_psicologica: [
        {
            id: 1,
            nombre: 'Dra. Laura Sánchez',
            bio: 'Psicóloga clínica con 8 años de experiencia en atención a víctimas de discriminación y violencia. Especialista en terapia cognitivo-conductual.',
            asesorias_completadas: 156
        },
        {
            id: 2,
            nombre: 'Dr. Miguel Ángel Ramírez',
            bio: 'Psicólogo social especializado en inclusión y diversidad. Trabaja con comunidades vulnerables desde hace 5 años.',
            asesorias_completadas: 98
        },
        {
            id: 3,
            nombre: 'Dra. Camila Ortiz',
            bio: 'Psicóloga organizacional con enfoque en bienestar laboral inclusivo. Ayuda a personas a superar barreras laborales por discriminación.',
            asesorias_completadas: 72
        }
    ],
    profesionales_juridica: [
        {
            id: 4,
            nombre: 'Dr. Fernando Castillo',
            bio: 'Abogado especialista en derechos humanos y derecho laboral. Experiencia en casos de discriminación y acoso laboral.',
            asesorias_completadas: 134
        },
        {
            id: 5,
            nombre: 'Dra. Patricia Vega',
            bio: 'Abogada con maestría en derecho constitucional. Defensora de derechos de poblaciones vulnerables y migrantes.',
            asesorias_completadas: 87
        },
        {
            id: 6,
            nombre: 'Dr. Ricardo Mendoza',
            bio: 'Abogado penalista con experiencia en protección de víctimas de violencia y discriminación. Pro-bono para comunidades vulnerables.',
            asesorias_completadas: 63
        }
    ]
};

// Variable global para saber si estamos en modo demo
let isDemoMode = false;
