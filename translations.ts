
export type Language = 'en' | 'ar' | 'de' | 'es';

export interface TranslationKeys {
  app_name: string;
  welcome: string;
  updated: string;
  nav_overview: string;
  nav_crops: string;
  nav_livestock: string;
  nav_advisor: string;
  nav_about: string;
  nav_blog: string;
  nav_settings: string;
  farm_overview: string;
  weather_humidity: string;
  weather_wind: string;
  weather_rain: string;
  stat_yield: string;
  stat_alerts: string;
  stat_moisture: string;
  stat_milk: string;
  priority_alerts: string;
  view_all: string;
  crop_monitoring: string;
  crop_subtitle: string;
  export_csv: string;
  drone_map: string;
  ndvi_config: string;
  my_fields: string;
  ai_doctor: string;
  upload_instruction: string;
  analyze_btn: string;
  download_report: string;
  growth_trends: string;
  insights_title: string;
  insight_ndvi_ndre: string;
  insight_growth_stage: string;
  insight_water_stress: string;
  insight_pest_disease: string;
  insight_thermal_stress: string;
  insight_nutrients: string;
  insight_yield: string;
  insight_weed: string;
  insight_canopy: string;
  insight_historical: string;
  label_ndre: string;
  label_vari: string;
  label_nitrogen: string;
  label_phosphorus: string;
  label_potassium: string;
  label_pest_pressure: string;
  label_disease_risk: string;
  label_weed_density: string;
  label_canopy_cover: string;
  label_forecast: string;
  livestock_monitoring: string;
  livestock_subtitle: string;
  live_feed: string;
  simulation: string;
  camera: string;
  obj_detection: string;
  behavior_analysis: string;
  quick_scan: string;
  herd_health: string;
  breeding_cycle: string;
  view_recs: string;
  barn_env: string;
  temp: string;
  air_quality: string;
  thermal_vision: string;
  normal_vision: string;
  estrus_detected: string;
  high_temp_alert: string;
  isolation_alert: string;
  isolation_msg: string;
  wound_detected: string;
  herd_count: string;
  animals_in_view: string;
  ai_vet: string;
  upload_animal_instruction: string;
  settings_theme: string;
  theme_light: string;
  theme_dark: string;
  theme_system: string;
  healthy: string;
  warning: string;
  critical: string;
  confidence: string;
  unknown: string;
  dismiss: string;
  undo: string;
  history_reports: string;
  generate_field_report: string;
  no_reports: string;
  view_report: string;
  delete_report: string;
  report_type_analysis: string;
  report_type_field: string;
}

export const translations: Record<Language, TranslationKeys> = {
  en: {
    app_name: "AgriVision AI",
    welcome: "Welcome back, Farm Admin",
    updated: "Updated",
    
    // Navigation
    nav_overview: "Overview",
    nav_crops: "Crop Monitor",
    nav_livestock: "Livestock",
    nav_advisor: "AI Advisor",
    nav_about: "About Us",
    nav_blog: "Blog",
    nav_settings: "Settings",

    // Overview
    farm_overview: "Farm Overview",
    weather_humidity: "Humidity",
    weather_wind: "Wind",
    weather_rain: "Rain",
    stat_yield: "Total Yield Prediction",
    stat_alerts: "Active Alerts",
    stat_moisture: "Soil Moisture Avg",
    stat_milk: "Daily Milk Yield",
    priority_alerts: "Priority Alerts",
    view_all: "View All",

    // Crops
    crop_monitoring: "Crop Monitoring",
    crop_subtitle: "Real-time surveillance & vegetation analytics",
    export_csv: "Export Data (CSV)",
    drone_map: "Drone Field Map Analysis",
    ndvi_config: "NDVI Configuration",
    my_fields: "My Fields",
    ai_doctor: "AI Crop Doctor (Single Plant)",
    upload_instruction: "Upload leaf or field image",
    analyze_btn: "Analyze Crop Health",
    download_report: "Download PDF Report",
    growth_trends: "NDVI Growth Trends",
    
    // Crop Insights
    insights_title: "Crop Monitoring – Key Insights & Reports",
    insight_ndvi_ndre: "NDVI/NDRE/VARI Index Maps",
    insight_growth_stage: "Growth Stage Analysis",
    insight_water_stress: "Water Stress Detection",
    insight_pest_disease: "Disease & Pest Infestation",
    insight_thermal_stress: "Thermal Stress Mapping",
    insight_nutrients: "Nutrient Deficiency Analysis",
    insight_yield: "Yield Estimation & Forecasting",
    insight_weed: "Weed Mapping",
    insight_canopy: "Canopy Cover Analysis",
    insight_historical: "Historical Health Comparison",
    
    label_ndre: "NDRE",
    label_vari: "VARI",
    label_nitrogen: "Nitrogen",
    label_phosphorus: "Phosphorus",
    label_potassium: "Potassium",
    label_pest_pressure: "Pest Pressure",
    label_disease_risk: "Disease Risk",
    label_weed_density: "Weed Density",
    label_canopy_cover: "Canopy Cover",
    label_forecast: "Forecast",
    
    // Livestock
    livestock_monitoring: "Livestock Monitoring",
    livestock_subtitle: "Real-time health tracking & behavior analysis",
    live_feed: "Barn Camera 01 (Main)",
    simulation: "Sim",
    camera: "Camera",
    obj_detection: "Object Detection",
    behavior_analysis: "Behavior Analysis",
    quick_scan: "Quick Scan",
    herd_health: "Herd Health Score",
    breeding_cycle: "Breeding Cycle",
    view_recs: "View Recommendations",
    barn_env: "Barn Environment",
    temp: "Temperature",
    air_quality: "Air Quality",
    thermal_vision: "Thermal Analysis",
    normal_vision: "Optical View",
    estrus_detected: "Estrus Detected",
    high_temp_alert: "High Temp Alert",
    isolation_alert: "Isolation Alert",
    isolation_msg: "Animal separated from herd - Potential sickness",
    wound_detected: "Visible Injury Detected",
    herd_count: "Herd Count",
    animals_in_view: "Animals in View",
    ai_vet: "AI Veterinary Diagnosis",
    upload_animal_instruction: "Upload animal image for health check",

    // Settings
    settings_theme: "App Theme",
    theme_light: "Light Mode",
    theme_dark: "Dark Mode",
    theme_system: "System Default",
    
    // Common
    healthy: "Healthy",
    warning: "Warning",
    critical: "Critical",
    confidence: "Conf.",
    unknown: "Unknown",
    dismiss: "Dismiss",
    undo: "Undo",
    history_reports: "Historical Reports & Comparison",
    generate_field_report: "Generate Full Field Report",
    no_reports: "No historical reports found.",
    view_report: "View",
    delete_report: "Delete",
    report_type_analysis: "AI Analysis",
    report_type_field: "Field Summary"
  },
  ar: {
    app_name: "أجري فيجن للذكاء الاصطناعي",
    welcome: "مرحباً بعودتك، مدير المزرعة",
    updated: "تم التحديث",

    nav_overview: "نظرة عامة",
    nav_crops: "مراقبة المحاصيل",
    nav_livestock: "الماشية",
    nav_advisor: "المستشار الذكي",
    nav_about: "من نحن",
    nav_blog: "المدونة",
    nav_settings: "الإعدادات",

    farm_overview: "نظرة عامة على المزرعة",
    weather_humidity: "الرطوبة",
    weather_wind: "الرياح",
    weather_rain: "المطر",
    stat_yield: "توقعات المحصول الكلي",
    stat_alerts: "تنبيهات نشطة",
    stat_moisture: "متوسط رطوبة التربة",
    stat_milk: "إنتاج الحليب اليومي",
    priority_alerts: "تنبيهات عاجلة",
    view_all: "عرض الكل",

    crop_monitoring: "مراقبة المحاصيل",
    crop_subtitle: "المراقبة الميدانية وتحليلات الغطاء النباتي",
    export_csv: "تصدير البيانات (CSV)",
    drone_map: "تحليل خرائط الدرون",
    ndvi_config: "إعدادات NDVI",
    my_fields: "حقولي",
    ai_doctor: "طبيب المحاصيل الذكي",
    upload_instruction: "ارفع صورة ورقة أو حقل",
    analyze_btn: "تحليل صحة المحصول",
    download_report: "تحميل تقرير PDF",
    growth_trends: "اتجاهات النمو NDVI",

    // Crop Insights
    insights_title: "رؤى وتقارير رئيسية",
    insight_ndvi_ndre: "خرائط مؤشرات NDVI/NDRE/VARI",
    insight_growth_stage: "تحليل مرحلة النمو",
    insight_water_stress: "كشف الإجهاد المائي",
    insight_pest_disease: "كشف الآفات والأمراض",
    insight_thermal_stress: "خرائط الإجهاد الحراري",
    insight_nutrients: "تحليل نقص المغذيات",
    insight_yield: "تقدير وتوقع المحصول",
    insight_weed: "خرائط الأعشاب الضارة",
    insight_canopy: "تحليل المظلة النباتية",
    insight_historical: "مقارنة تاريخية",

    label_ndre: "NDRE",
    label_vari: "VARI",
    label_nitrogen: "نيتروجين",
    label_phosphorus: "فسفور",
    label_potassium: "بوتاسيوم",
    label_pest_pressure: "ضغط الآفات",
    label_disease_risk: "خطر الأمراض",
    label_weed_density: "كثافة الأعشاب",
    label_canopy_cover: "تغطية المظلة",
    label_forecast: "توقعات",

    livestock_monitoring: "مراقبة الماشية",
    livestock_subtitle: "تتبع الصحة وتحليل السلوك في الوقت الفعلي",
    live_feed: "كاميرا الحظيرة 01 (رئيسية)",
    simulation: "محاكاة",
    camera: "كاميرا",
    obj_detection: "كشف الكائنات",
    behavior_analysis: "تحليل السلوك",
    quick_scan: "فحص سريع",
    herd_health: "درجة صحة القطيع",
    breeding_cycle: "دورة التكاثر",
    view_recs: "عرض التوصيات",
    barn_env: "بيئة الحظيرة",
    temp: "درجة الحرارة",
    air_quality: "جودة الهواء",
    thermal_vision: "التحليل الحراري",
    normal_vision: "رؤية بصرية",
    estrus_detected: "دورة نزق مكتشفة",
    high_temp_alert: "تنبيه حرارة عالية",
    isolation_alert: "تنبيه عزل",
    isolation_msg: "حيوان منفصل عن القطيع - احتمال مرض",
    wound_detected: "تم اكتشاف إصابة ظاهرة",
    herd_count: "تعداد القطيع",
    animals_in_view: "حيوانات في العرض",
    ai_vet: "التشخيص البيطري بالذكاء الاصطناعي",
    upload_animal_instruction: "ارفع صورة الحيوان للفحص الصحي",

    settings_theme: "مظهر التطبيق",
    theme_light: "الوضع الفاتح",
    theme_dark: "الوضع الداكن",
    theme_system: "النظام الافتراضي",

    healthy: "صحي",
    warning: "تحذير",
    critical: "خطر",
    confidence: "ثقة",
    unknown: "غير معروف",
    dismiss: "تجاهل",
    undo: "تراجع",
    history_reports: "التقارير التاريخية والمقارنة",
    generate_field_report: "إنشاء تقرير ميداني كامل",
    no_reports: "لا توجد تقارير تاريخية.",
    view_report: "عرض",
    delete_report: "حذف",
    report_type_analysis: "تحليل الذكاء الاصطناعي",
    report_type_field: "ملخص ميداني"
  },
  de: {
    app_name: "AgriVision AI",
    welcome: "Willkommen zurück, Farm Admin",
    updated: "Aktualisiert",

    nav_overview: "Übersicht",
    nav_crops: "Pflanzenüberwachung",
    nav_livestock: "Viehbestand",
    nav_advisor: "KI-Berater",
    nav_about: "Über uns",
    nav_blog: "Blog",
    nav_settings: "Einstellungen",

    farm_overview: "Betriebsübersicht",
    weather_humidity: "Feuchtigkeit",
    weather_wind: "Wind",
    weather_rain: "Regen",
    stat_yield: "Gesamtertragsprognose",
    stat_alerts: "Aktive Warnungen",
    stat_moisture: "Bodenfeuchte Ø",
    stat_milk: "Tägliche Milchleistung",
    priority_alerts: "Prioritätswarnungen",
    view_all: "Alle ansehen",

    crop_monitoring: "Pflanzenüberwachung",
    crop_subtitle: "Echtzeit-Überwachung & Vegetationsanalyse",
    export_csv: "Daten exportieren (CSV)",
    drone_map: "Drohnen-Feldanalyse",
    ndvi_config: "NDVI-Konfiguration",
    my_fields: "Meine Felder",
    ai_doctor: "KI-Pflanzendoktor",
    upload_instruction: "Blatt- oder Feldbild hochladen",
    analyze_btn: "Pflanzengesundheit analysieren",
    download_report: "PDF-Bericht herunterladen",
    growth_trends: "NDVI Wachstumstrends",

    // Crop Insights
    insights_title: "Wichtige Erkenntnisse & Berichte",
    insight_ndvi_ndre: "NDVI/NDRE/VARI Index-Karten",
    insight_growth_stage: "Wachstumsstadium-Analyse",
    insight_water_stress: "Wasserstress-Erkennung",
    insight_pest_disease: "Schädlings- & Krankheitsbefall",
    insight_thermal_stress: "Thermische Stresskartierung",
    insight_nutrients: "Nährstoffmangel-Analyse",
    insight_yield: "Ertragsschätzung & Prognose",
    insight_weed: "Unkrautkartierung",
    insight_canopy: "Kronenanalyse",
    insight_historical: "Historischer Gesundheitsvergleich",

    label_ndre: "NDRE",
    label_vari: "VARI",
    label_nitrogen: "Stickstoff",
    label_phosphorus: "Phosphor",
    label_potassium: "Kalium",
    label_pest_pressure: "Schädlingsdruck",
    label_disease_risk: "Krankheitsrisiko",
    label_weed_density: "Unkrautdichte",
    label_canopy_cover: "Kronendeckung",
    label_forecast: "Prognose",

    livestock_monitoring: "Viehüberwachung",
    livestock_subtitle: "Gesundheitsverfolgung & Verhaltensanalyse",
    live_feed: "Stallkamera 01 (Haupt)",
    simulation: "Sim",
    camera: "Kamera",
    obj_detection: "Objekterkennung",
    behavior_analysis: "Verhaltensanalyse",
    quick_scan: "Schnellscan",
    herd_health: "Herdengesundheit",
    breeding_cycle: "Zuchtzyklus",
    view_recs: "Empfehlungen ansehen",
    barn_env: "Stallumgebung",
    temp: "Temperatur",
    air_quality: "Luftqualität",
    thermal_vision: "Thermische Analyse",
    normal_vision: "Optische Ansicht",
    estrus_detected: "Östrus erkannt",
    high_temp_alert: "Hohe Temperaturwarnung",
    isolation_alert: "Isolationswarnung",
    isolation_msg: "Tier von Herde getrennt - Mögliche Krankheit",
    wound_detected: "Sichtbare Verletzung erkannt",
    herd_count: "Herdenzählung",
    animals_in_view: "Tiere im Blick",
    ai_vet: "KI-Veterinärdiagnose",
    upload_animal_instruction: "Tierbild für Gesundheitscheck hochladen",

    settings_theme: "App-Design",
    theme_light: "Heller Modus",
    theme_dark: "Dunkler Modus",
    theme_system: "Systemstandard",

    healthy: "Gesund",
    warning: "Warnung",
    critical: "Kritisch",
    confidence: "Konf.",
    unknown: "Unbekannt",
    dismiss: "Verwerfen",
    undo: "Rückgängig",
    history_reports: "Historische Berichte & Vergleich",
    generate_field_report: "Vollständigen Feldbericht erstellen",
    no_reports: "Keine historischen Berichte gefunden.",
    view_report: "Ansehen",
    delete_report: "Löschen",
    report_type_analysis: "KI-Analyse",
    report_type_field: "Feldzusammenfassung"
  },
  es: {
    app_name: "AgriVision AI",
    welcome: "Bienvenido de nuevo, Admin",
    updated: "Actualizado",

    nav_overview: "Resumen",
    nav_crops: "Cultivos",
    nav_livestock: "Ganado",
    nav_advisor: "Asesor IA",
    nav_about: "Sobre Nosotros",
    nav_blog: "Blog",
    nav_settings: "Configuración",

    farm_overview: "Resumen de la Granja",
    weather_humidity: "Humedad",
    weather_wind: "Viento",
    weather_rain: "Lluvia",
    stat_yield: "Predicción de Rendimiento",
    stat_alerts: "Alertas Activas",
    stat_moisture: "Humedad del Suelo Prom.",
    stat_milk: "Producción Diaria de Leche",
    priority_alerts: "Alertas Prioritarias",
    view_all: "Ver Todo",

    crop_monitoring: "Monitoreo de Cultivos",
    crop_subtitle: "Vigilancia en tiempo real y análisis de vegetación",
    export_csv: "Exportar Datos (CSV)",
    drone_map: "Análisis de Mapa de Drones",
    ndvi_config: "Configuración NDVI",
    my_fields: "Mis Campos",
    ai_doctor: "Doctor de Cultivos IA",
    upload_instruction: "Subir imagen de hoja o campo",
    analyze_btn: "Analizar Salud",
    download_report: "Descargar Informe PDF",
    growth_trends: "Tendencias de Crecimiento NDVI",

    // Crop Insights
    insights_title: "Información Clave y Reportes",
    insight_ndvi_ndre: "Mapas de Índices NDVI/NDRE/VARI",
    insight_growth_stage: "Análisis de Etapa de Crecimiento",
    insight_water_stress: "Detección de Estrés Hídrico",
    insight_pest_disease: "Detección de Plagas y Enfermedades",
    insight_thermal_stress: "Mapeo de Estrés Térmico",
    insight_nutrients: "Análisis de Deficiencia de Nutrientes",
    insight_yield: "Estimación y Pronóstico de Rendimiento",
    insight_weed: "Mapeo de Malezas",
    insight_canopy: "Análisis de Cobertura de Dosel",
    insight_historical: "Comparación Histórica de Salud",

    label_ndre: "NDRE",
    label_vari: "VARI",
    label_nitrogen: "Nitrógeno",
    label_phosphorus: "Fósforo",
    label_potassium: "Potasio",
    label_pest_pressure: "Presión de Plagas",
    label_disease_risk: "Riesgo de Enfermedad",
    label_weed_density: "Densidad de Malezas",
    label_canopy_cover: "Cobertura de Dosel",
    label_forecast: "Pronóstico",

    livestock_monitoring: "Monitoreo de Ganado",
    livestock_subtitle: "Seguimiento de salud y comportamiento en tiempo real",
    live_feed: "Cámara de Establo 01",
    simulation: "Sim",
    camera: "Cámara",
    obj_detection: "Detección de Objetos",
    behavior_analysis: "Análisis de Comportamiento",
    quick_scan: "Escaneo Rápido",
    herd_health: "Salud del Rebaño",
    breeding_cycle: "Ciclo de Cría",
    view_recs: "Ver Recomendaciones",
    barn_env: "Ambiente del Establo",
    temp: "Temperatura",
    air_quality: "Calidad del Aire",
    thermal_vision: "Análisis Térmico",
    normal_vision: "Vista Óptica",
    estrus_detected: "Detección de Celo",
    high_temp_alert: "Alerta de Alta Temp",
    isolation_alert: "Alerta de Aislamiento",
    isolation_msg: "Animal separado del rebaño - Posible enfermedad",
    wound_detected: "Lesión Visible Detectada",
    herd_count: "Conteo del Rebaño",
    animals_in_view: "animales en vista",
    ai_vet: "Diagnóstico Veterinario IA",
    upload_animal_instruction: "Subir imagen del animal para revisión de salud",

    settings_theme: "Tema de la App",
    theme_light: "Modo Claro",
    theme_dark: "Modo Oscuro",
    theme_system: "Predeterminado",
    
    healthy: "Saludable",
    warning: "Advertencia",
    critical: "Crítico",
    confidence: "Conf.",
    unknown: "Desconocido",
    dismiss: "Descartar",
    undo: "Deshacer",
    history_reports: "Informes Históricos y Comparación",
    generate_field_report: "Generar Informe de Campo Completo",
    no_reports: "No se encontraron informes históricos.",
    view_report: "Ver",
    delete_report: "Eliminar",
    report_type_analysis: "Análisis IA",
    report_type_field: "Resumen de Campo"
  }
};
