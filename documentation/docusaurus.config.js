const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

// With JSDoc @type annotations, IDEs can provide config autocompletion
/** @type {import('@docusaurus/types').DocusaurusConfig} */
(
  module.exports = {
    title: 'Bearer Auth React Context',
    tagline: 'Dinosaurs are cool',
    url: 'https://frysztak.github.io',
    baseUrl: '/bearer-auth-react-context/',
    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',
    favicon: 'img/favicon.ico',
    organizationName: 'frysztak',
    projectName: 'bearer-auth-react-context',
    trailingSlash: false,

    presets: [
      [
        '@docusaurus/preset-classic',
        /** @type {import('@docusaurus/preset-classic').Options} */
        ({
          docs: {
            routeBasePath: '/',
            sidebarPath: require.resolve('./sidebars.js'),
            // Please change this to your repo.
            editUrl:
              'https://github.com/facebook/docusaurus/edit/main/website/',
          },
          blog: {
            showReadingTime: true,
            // Please change this to your repo.
            editUrl:
              'https://github.com/facebook/docusaurus/edit/main/website/blog/',
          },
          theme: {
            customCss: require.resolve('./src/css/custom.css'),
          },
        }),
      ],
    ],

    themeConfig:
      /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
      ({
        navbar: {
          title: 'Bearer Auth React Context',
          logo: {
            alt: 'Bearer Auth React Context Logo',
            src: 'img/logo.svg',
          },
          items: [
            {
              href: 'https://github.com/frysztak/bearer-auth-react-context',
              label: 'GitHub',
              position: 'right',
            },
          ],
        },
        footer: {
          style: 'dark',
          links: [],
          copyright: `Copyright © ${new Date().getFullYear()} Sebastian Frysztak. Built with Docusaurus.`,
        },
        prism: {
          theme: lightCodeTheme,
          darkTheme: darkCodeTheme,
        },
      }),

    plugins: [
      [
        'docusaurus-plugin-typedoc',
        // Plugin / TypeDoc options
        {
          entryPoints: ['../src/index.ts'],
          tsconfig: '../tsconfig.json',
          hideBreadcrumbs: true,
          sort: 'source-order',
          disableSources: true,
        },
      ],
    ],
  }
);
