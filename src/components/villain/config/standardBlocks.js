export default [
  {
    name: 'Tekst',
    icon: 'fa-paragraph',
    component: 'Text',
    dataTemplate: {
      'text': '',
      'type': 'paragraph'
    }
  },

  {
    name: 'Overskrift',
    icon: 'fa-heading',
    component: 'Header',
    dataTemplate: {
      'text': 'Overskrift',
      'level': 1,
      'class': ''
    }
  },

  {
    name: 'Skillelinje',
    icon: 'fa-minus',
    component: 'Divider',
    dataTemplate: {
      'text': '-------------'
    }
  },

  {
    name: 'Bilde',
    icon: 'fa-image',
    component: 'Image',
    dataTemplate: {
      url: '',
      sizes: null,
      title: '',
      credits: '',
      class: 'img-fluid',
      series_slug: 'post'
    }
  },

  {
    name: 'Bildekarusell',
    icon: 'fa-images',
    component: 'Slideshow',
    dataTemplate: {
      images: [],
      class: '',
      series_slug: 'post'
    }
  },

  {
    name: 'Bildefigur (avansert)',
    icon: 'fa-portrait',
    component: 'Picture',
    dataTemplate: {
      url: '',
      sizes: null,
      title: '',
      credits: '',
      img_class: 'img-fluid',
      picture_class: '',
      srcset: '',
      media_queries: '',
      series_slug: 'post'
    }
  },

  {
    name: 'Svg',
    icon: 'fa-code',
    component: 'Svg',
    dataTemplate: {
      'code': 'Lim inn svg tag her',
      'class': ''
    }
  },

  {
    name: 'Datatabell',
    icon: 'fa-table',
    component: 'Datatable',
    dataTemplate: []
  },

  {
    name: 'Video',
    icon: 'fa-video',
    component: 'Video',
    dataTemplate: {
      source: 'youtube',
      remote_id: ''
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
      'text': 'Sitat',
      'cite': 'Sitatforfatter'
    }
  },

  {
    name: 'Tidslinje',
    icon: 'fa-clock',
    component: 'Timeline',
    dataTemplate: [
      {
        'caption': '2018',
        'text': 'Tekst om hendelsen'
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
      'text': '## Markdown code'
    }
  },

  {
    name: 'Html',
    icon: 'fa-file-code',
    component: 'Html',
    dataTemplate: {
      'text': 'html'
    }
  },

  {
    name: 'Kommentar (vises ikke)',
    icon: 'fa-comment',
    component: 'Comment',
    dataTemplate: {
      'text': 'Kommentar...'
    }
  }
]
