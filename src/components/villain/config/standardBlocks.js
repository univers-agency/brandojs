export default [
  {
    name: 'Tekst',
    icon: 'fa-paragraph',
    component: 'Text',
    dataTemplate: {
      text: '',
      type: 'paragraph'
    }
  },

  {
    name: 'Overskrift',
    icon: 'fa-heading',
    component: 'Header',
    dataTemplate: {
      text: 'Overskrift',
      level: 1,
      class: null,
      id: null
    }
  },

  {
    name: 'Skillelinje',
    icon: 'fa-minus',
    component: 'Divider',
    dataTemplate: {
      text: '-------------'
    }
  },

  {
    name: 'Media',
    icon: 'fa-photo-video',
    component: 'Media',
    dataTemplate: {
      type: null,
      available_components: [
        { component: 'Picture', dataTemplate: {} },
        { component: 'Video', dataTemplate: {} },
        { component: 'Slideshow', dataTemplate: {} },
        { component: 'Svg', dataTemplate: {} }
      ],
      data: null
    }
  },

  {
    name: 'Bilde — legacy',
    icon: 'fa-image',
    component: 'Image',
    hide: true,
    dataTemplate: {
      url: '',
      sizes: null,
      title: '',
      credits: '',
      alt: '',
      class: 'img-fluid',
      series_slug: 'post'
    }
  },

  {
    name: 'Galleri/slider',
    icon: 'fa-images',
    component: 'Slideshow',
    dataTemplate: {
      images: [],
      class: '',
      series_slug: 'post'
    }
  },

  {
    name: 'Bilde',
    icon: 'fa-portrait',
    component: 'Picture',
    dataTemplate: {
      url: '',
      sizes: null,
      title: '',
      credits: '',
      alt: '',
      img_class: 'img-fluid',
      picture_class: '',
      srcset: '',
      media_queries: '',
      series_slug: 'post'
    }
  },

  {
    name: 'Video',
    icon: 'fa-video',
    component: 'Video',
    dataTemplate: {
      source: 'youtube',
      remote_id: '',
      width: null,
      height: null
    }
  },

  {
    name: 'Datakilde',
    icon: 'fa-database',
    component: 'Datasource',
    dataTemplate: {
      module: null,
      type: null,
      query: null,
      template: null,
      wrapper: null,
      arg: null,
      description: null
    }
  },

  {
    name: 'Svg',
    icon: 'fa-code',
    component: 'Svg',
    dataTemplate: {
      code: '',
      class: ''
    }
  },

  {
    name: 'Datatabell',
    icon: 'fa-table',
    component: 'Datatable',
    dataTemplate: {
      rows: []
    }
  },

  {
    name: 'Kart',
    icon: 'fa-compass',
    component: 'Map',
    dataTemplate: {
      source: 'gmaps',
      embed_url: ''
    }
  },

  {
    name: 'Sitat',
    icon: 'fa-quote-right',
    component: 'Blockquote',
    dataTemplate: {
      text: 'Sitat',
      cite: 'Sitatforfatter'
    }
  },

  {
    name: 'Tidslinje',
    icon: 'fa-clock',
    component: 'Timeline',
    dataTemplate: [
      {
        caption: '2018',
        text: 'Tekst om hendelsen'
      }
    ]
  },

  {
    name: 'Kolonner',
    icon: 'fa-columns',
    component: 'Columns',
    dataTemplate: []
  },

  {
    name: 'Markdown',
    icon: 'fa-code',
    component: 'Markdown',
    dataTemplate: {
      text: '## Markdown code'
    }
  },

  {
    name: 'Html',
    icon: 'fa-file-code',
    component: 'Html',
    dataTemplate: {
      text: 'html'
    }
  },

  {
    name: 'Kommentar (vises ikke)',
    icon: 'fa-comment',
    component: 'Comment',
    dataTemplate: {
      text: 'Kommentar...'
    }
  }
]
