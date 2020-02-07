export default {
  nb: [
    {
      name: 'System',
      items: [
        {
          name: 'Dashboard',
          to: {
            name: 'dashboard'
          }
        },
        {
          name: 'Konfigurasjon',
          items: [
            {
              text: 'Identitet',
              to: {
                name: 'config-identity'
              }
            }, {
              text: 'Globale variabler',
              to: {
                name: 'config-globals'
              }
            }, {
              text: 'Innholdsmaler',
              to: {
                name: 'templates'
              }
            }
          ]
        }, {
          name: 'Brukere',
          to: {
            name: 'users'
          }
        }, {
          name: 'Bildebibliotek',
          to: {
            name: 'images'
          }
        }, {
          name: 'Filbibliotek',
          to: {
            name: 'files'
          }
        }
      ]
    },
    {
      name: 'Innhold',
      items: [
        {
          name: 'Sider & seksjoner',
          to: {
            name: 'pages'
          }
        }
      ]
    }
  ],

  en: [
    {
      name: 'System',
      items: [
        {
          name: 'Dashboard',
          to: {
            name: 'dashboard'
          }
        },
        {
          name: 'Configuration',
          items: [
            {
              text: 'Identity',
              to: {
                name: 'config-identity'
              }
            }, {
              text: 'Globals',
              to: {
                name: 'config-globals'
              }
            }, {
              text: 'Templates',
              to: {
                name: 'templates'
              }
            }
          ]
        }, {
          name: 'Users',
          to: {
            name: 'users'
          }
        }, {
          name: 'Image Library',
          to: {
            name: 'images'
          }
        }, {
          name: 'File Library',
          to: {
            name: 'files'
          }
        }
      ]
    },
    {
      name: 'Content',
      items: [
        {
          name: 'Pages & Sections',
          to: {
            name: 'pages'
          }
        }
      ]
    }
  ]
}
