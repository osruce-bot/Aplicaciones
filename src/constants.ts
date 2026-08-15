export interface App {
  id: string;
  name: string;
  url: string;
}

export interface Category {
  name: string;
  apps: App[];
}

export const APP_CATEGORIES: Category[] = [
  {
    name: 'Legal y Contratos',
    apps: [
      { id: '1', name: 'Actas Automáticas', url: 'https://aistudio.google.com/apps/02a10f6b-e143-44aa-b254-d4663c48de17?showAssistant=true&showPreview=true&fullscreenApplet=true' },
      { id: '16', name: 'Redacción de Contratos de Alquiler', url: 'https://aistudio.google.com/apps/drive/12pVdAaisM-rH5kXLG0lsjGyQFZBZev5z?source=start&showAssistant=true&showPreview=true&resourceKey=&fullscreenApplet=true' },
      { id: '31', name: 'Redacción Perfecta', url: 'https://aistudio.google.com/apps/db41c2ac-1de2-414c-906f-87e8b6b239e7?showPreview=true&showAssistant=true&fullscreenApplet=true' },
      { id: '20', name: 'Redacción de Contratos de Reserva', url: 'https://aistudio.google.com/apps/drive/1RE8vFKqqb0oEXVUyByuIMkp8YzwlVKo7?showAssistant=true&showPreview=true&resourceKey=&fullscreenApplet=true' },
    ],
  },
  {
    name: 'Inmobiliaria y Gestión',
    apps: [
      { id: '3', name: 'Checklist Documentos Para Alquiler o Venta', url: 'https://aistudio.google.com/apps/drive/19NEBOCak0hSZyJ1dfBIvYWi0owz_GniP?showPreview=true&showAssistant=true&fullscreenApplet=true' },
      { id: '27', name: 'Altas y Bajas', url: 'https://aistudio.google.com/apps/e7bccdfc-841c-4482-a247-8413e8ec88e4?source=start&showPreview=true&showAssistant=true&fullscreenApplet=true' },
      { id: '7', name: 'Informe al Propietario', url: 'https://aistudio.google.com/apps/drive/1M2cIoOFgMFQ9UouEGQvOCfDCAnvHsEco?showPreview=true&showAssistant=true&fullscreenApplet=true' },
      { id: '8', name: 'Scoring de Inquilino', url: 'https://aistudio.google.com/apps/drive/1B0eQV4JTHuPXN8UI1nkwYJkfDHKVRATr?showPreview=true&showAssistant=true&fullscreenApplet=true' },
      { id: '6', name: 'ACM Pro', url: 'https://aistudio.google.com/apps/drive/14QdzXrOjorzAJV8Jqf9C6oITqRwtxBFL?showPreview=true&showAssistant=true&fullscreenApplet=true' },
      { id: '21', name: 'Estudio de Títulos', url: 'https://aistudio.google.com/apps/drive/1RSRCyMpkd_WEEG0meJUcyN--0s6GPpyz?showPreview=true&showAssistant=true&fullscreenApplet=true' },
    ],
  },
  {
    name: 'Finanzas',
    apps: [
      { id: '24', name: 'Cierres Master', url: 'https://aistudio.google.com/apps/drive/1fjci2OWafetnNp6zg1gulFMzAMHQUVOi?showPreview=true&showAssistant=true&resourceKey=&fullscreenApplet=true' },
      { id: '9', name: 'Calculadora ROI', url: 'https://aistudio.google.com/apps/834f35b7-fe29-4538-b889-859be12fe61e?showPreview=true&showAssistant=true&fullscreenApplet=true' },
      { id: '17', name: 'Calculo Impuesto a la Renta', url: 'https://aistudio.google.com/apps/drive/1l2zG9MPdrdu20vPANj8lKnxcFuUm-bDF?showPreview=true&showAssistant=true&fullscreenApplet=true' },
      { id: '18', name: 'Calculo Impuesto a la Alcabala', url: 'https://aistudio.google.com/apps/drive/1LCZat4-7alaGpsq6gfLjWmfE_QwigB8x?showAssistant=true&showPreview=true&resourceKey=&fullscreenApplet=true' },
      { id: '33', name: 'Liquidación Asistente', url: 'https://aistudio.google.com/apps/4b748f80-56f5-48a8-bfe2-4af900d6043c?showPreview=true&showAssistant=true&fullscreenApplet=true' },
    ],
  },
  {
    name: 'Marketing y Contenido',
    apps: [
      { id: '29', name: 'Videos de 1 Minuto', url: 'https://aistudio.google.com/apps/21c324d6-ef72-44dd-aa80-016adf66dc03?showPreview=true&showAssistant=true&fullscreenApplet=true' },
      { id: '36', name: 'Videos Cortos', url: 'https://aistudio.google.com/apps/4bdd62ad-d59b-4617-bc7e-bef36e4bbf4a?showPreview=true&showAssistant=true&fullscreenApplet=true' },
      { id: '28', name: 'Metodología CIA', url: 'https://aistudio.google.com/apps/a01ca807-6abf-4cca-baef-a1279dba6851?showPreview=true&showAssistant=true&fullscreenApplet=true' },
      { id: '23', name: 'Generador de Flyers Inmobiliarios (Campañas)', url: 'https://aistudio.google.com/apps/f847bc27-7964-4332-8267-c18368896870?source=start&showPreview=true&showAssistant=true&fullscreenApplet=true' },
      { id: '11', name: 'Generador de Ads', url: 'https://aistudio.google.com/apps/drive/1azXIc24Gt7_LufxtbDgOfBvEe5ZuJLOr?showPreview=true&showAssistant=true&fullscreenApplet=true' },
      { id: '12', name: 'Storytelling Deportivo', url: 'https://aistudio.google.com/apps/drive/1D2U4gHqX4fYvNscEY8R-wt7XXdwSVFmf?showPreview=true&showAssistant=true&fullscreenApplet=true' },
      { id: '35', name: 'Respuestas Rápidas en WhatsApp', url: 'https://aistudio.google.com/apps/7db8bf59-ed41-431e-bdc9-6d131e1d98dc?showPreview=true&showAssistant=true&fullscreenApplet=true' },
      { id: '34', name: 'Storytelling Inmobiliario', url: 'https://aistudio.google.com/apps/drive/152GNVvmWnSuuk2GpDFZ0bZCGrdXGKJ8H?showAssistant=true&showPreview=true&resourceKey=&fullscreenApplet=true' },
      { id: '14', name: 'Foto Corporativa', url: 'https://aistudio.google.com/apps/drive/19OdVe6KumVkvB5Y7hmhS5PERfB1VcNm4?source=start&showAssistant=true&showPreview=true&resourceKey=&fullscreenApplet=true' },
      { id: '32', name: 'Descripción del Inmueble', url: 'https://aistudio.google.com/apps/ae7ca874-21e5-4f30-99c8-4ca761a034d5?showPreview=true&showAssistant=true&fullscreenApplet=true' },
      { id: '15', name: 'Guionista de Video / Hashtag', url: 'https://aistudio.google.com/apps/drive/1yy1VvJevEsnRSR_K45QCE_AqhLoYCOYS?showPreview=true&showAssistant=true&fullscreenApplet=true' },
      { id: '30', name: 'Generador de Pies de imagen', url: 'https://aistudio.google.com/apps/ba3d9d9e-9eed-46d9-87f7-5b206c937c42?showPreview=true&showAssistant=true&fullscreenApplet=true' },
      { id: '25', name: 'Plan Mensual de Contenido en Redes', url: 'https://aistudio.google.com/apps/drive/14JeT00SdMbA3XrFRYNL9yHYYGB6j62Y6?showAssistant=true&showPreview=true&resourceKey=&fullscreenApplet=true' },
      { id: '13', name: 'Trivia Interactiva', url: 'https://aistudio.google.com/apps/drive/1-WVCPefhTud-YI3gCN-DOqWylGr-ZyRp?showPreview=true&showAssistant=true&fullscreenApplet=true' },
      { id: '5', name: 'Prompt Maestro', url: 'https://aistudio.google.com/apps/drive/1GksGVPgtWluz5OlEaFLtRoXU66N0tlFO?showAssistant=true&showPreview=true&resourceKey=&fullscreenApplet=true' },
      { id: '10', name: 'Radar de Oportunidades', url: 'https://aistudio.google.com/apps/drive/1RaD83UweWkr5YAfbSZWb9jnYWzdDf-ku?showPreview=true&showAssistant=true&fullscreenApplet=true' },
    ],
  },
  {
    name: 'Herramientas y Varios',
    apps: [
      { id: '19', name: 'Santa Secreto AI', url: 'https://aistudio.google.com/apps/drive/1aOBynjxYBGMWzPT3qybuJbzUIqQXCv2s?showAssistant=true&showPreview=true&resourceKey=&fullscreenApplet=true' },
      { id: '22', name: 'Cuentas Equitativas - Familia', url: 'https://aistudio.google.com/apps/drive/1pL1vmBaWmmOf0rBi77cSUG55ZOjXmOy1?showPreview=true&showAssistant=true&fullscreenApplet=true' },
    ],
  },
];
