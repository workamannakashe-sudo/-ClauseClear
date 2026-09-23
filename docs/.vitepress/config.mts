import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'ClauseClear Documentation',
  description: 'AI-Powered GenAI Legal Assistant & Access System for Indian Residential Tenants ("Riya")',
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Architecture', link: '/architecture' },
      { text: 'API Reference', link: '/api' },
      { text: 'Evals & Benchmarks', link: '/EVAL' },
      { text: 'Deployment Presets', link: '/deployment' }
    ],
    sidebar: [
      {
        text: 'Overview & Persona',
        items: [
          { text: 'System Overview', link: '/' },
          { text: 'Target Persona ("Riya")', link: '/DEMO' },
          { text: 'Design & Architecture', link: '/architecture' },
          { text: 'Decision Matrix', link: '/DECISIONS' }
        ]
      },
      {
        text: 'Technical & Security',
        items: [
          { text: 'API Specifications', link: '/api' },
          { text: 'Threat Model & Security', link: '/THREAT_MODEL' },
          { text: 'Accessibility (WCAG 2.1 AA)', link: '/ACCESSIBILITY' },
          { text: 'Performance Benchmarks', link: '/PERFORMANCE' },
          { text: 'Evaluation Suite', link: '/EVAL' }
        ]
      },
      {
        text: 'Deployment & Presets',
        items: [
          { text: 'Application Presets & Hosting', link: '/deployment' }
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/workamannakashe-sudo/AI-for-Legal-Assistance-Access-promptwar' }
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 ClauseClear Team · Prompt Wars S2'
    }
  }
});
