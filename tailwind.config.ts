import containerQueries from '@tailwindcss/container-queries';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';

export default {
	darkMode: 'class',
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			// Anpassad typografi för bättre läsbarhet
			typography: (theme: any) => ({
				DEFAULT: {
					css: {
						maxWidth: '70ch',
						color: theme('colors.gray.800'),
						lineHeight: '1.75',
						fontSize: '1.05rem',
						p: {
							marginTop: '1.1em',
							marginBottom: '1.1em'
						},
						a: {
							color: theme('colors.gray.900'),
							textDecoration: 'underline',
							textUnderlineOffset: '4px',
							fontWeight: '500'
						},
						'h2,h3,h4': {
							fontFamily: "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
							fontWeight: '600',
							lineHeight: '1.2',
							letterSpacing: '-0.02em'
						},
						h2: {
							fontSize: '2.1rem',
							marginTop: '2.4em',
							marginBottom: '0.9em'
						},
						h3: {
							fontSize: '1.55rem',
							marginTop: '2em',
							marginBottom: '0.7em'
						},
						h4: {
							fontSize: '1.25rem',
							marginTop: '1.6em',
							marginBottom: '0.6em'
						},
						'blockquote p:first-of-type': {
							marginTop: 0
						},
						'blockquote p:last-of-type': {
							marginBottom: 0
						},
						blockquote: {
							fontStyle: 'italic',
							color: theme('colors.gray.700'),
							borderLeftColor: theme('colors.gray.300'),
							paddingLeft: '1rem'
						},
						code: {
							background: theme('colors.gray.100'),
							padding: '0.25rem 0.45rem',
							borderRadius: '4px',
							fontSize: '0.9em'
						},
						pre: {
							background: theme('colors.gray.900'),
							color: theme('colors.gray.100'),
							padding: '1rem 1.25rem',
							fontSize: '0.9em',
							lineHeight: '1.6'
						},
						'ul,ol': {
							paddingLeft: '1.3em'
						},
						li: {
							marginTop: '0.3em',
							marginBottom: '0.3em'
						}
					}
				},
				// Anpassad större variant
				reading: {
					css: {
						maxWidth: '72ch',
						fontSize: '1.15rem',
						lineHeight: '1.8',
						color: theme('colors.gray.800'),
						p: {
							fontSize: '1.15rem',
							lineHeight: '1.75',
							marginTop: '0.9em',
							marginBottom: '0.9em'
						},
						'h2,h3,h4': {
							fontFamily: "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
							fontWeight: '600',
							lineHeight: '1.15',
							letterSpacing: '-0.02em'
						},
						h2: {
							fontSize: '2.3rem',
							marginTop: '2.2em',
							marginBottom: '0.7em'
						},
						h3: {
							fontSize: '1.65rem',
							marginTop: '1.7em',
							marginBottom: '0.55em'
						},
						h4: {
							fontSize: '1.25rem',
							marginTop: '1.3em',
							marginBottom: '0.5em'
						},
						strong: {
							color: theme('colors.gray.900')
						},
						'ul,ol': {
							paddingLeft: '1.25em',
							marginTop: '0.9em',
							marginBottom: '0.95em'
						},
						li: {
							marginTop: '0.25em',
							marginBottom: '0.25em'
						},
						'li > ul, li > ol': {
							marginTop: '0.6em',
							marginBottom: '0.6em'
						},
						blockquote: {
							fontStyle: 'italic',
							background: theme('colors.gray.50'),
							padding: '0.75rem 1rem',
							borderLeft: '3px solid ' + theme('colors.gray.300'),
							color: theme('colors.gray.700'),
							marginTop: '1.4em',
							marginBottom: '1.4em'
						},
						code: {
							background: theme('colors.gray.100'),
							padding: '0.25rem 0.5rem',
							borderRadius: '4px',
							fontSize: '0.92em'
						},
						'code::before, code::after': { content: 'none' },
						pre: {
							background: theme('colors.slate.900'),
							color: theme('colors.slate.100'),
							padding: '1.1rem 1.25rem',
							fontSize: '0.95em',
							lineHeight: '1.6'
						},
						table: {
							fontSize: '0.95em'
						},
						'::-moz-selection': {
							background: theme('colors.yellow.200')
						},
						'::selection': {
							background: theme('colors.yellow.200')
						},
						a: {
							color: theme('colors.sky.700'),
							textDecoration: 'underline',
							textUnderlineOffset: '4px',
							fontWeight: '500'
						},
						'a:hover': {
							color: theme('colors.sky.900')
						},
						'@screen lg': {
							h2: { fontSize: '2.55rem' },
							h3: { fontSize: '1.85rem' },
							h4: { fontSize: '1.3rem' },
							p: { fontSize: '1.17rem' }
						},
						'.dark &': {
							color: theme('colors.gray.100')
						},
						'.dark & a': {
							color: theme('colors.sky.300')
						},
						'.dark & a:hover': {
							color: theme('colors.sky.200')
						},
						'.dark & blockquote': {
							background: theme('colors.gray.800'),
							color: theme('colors.gray.100'),
							borderLeftColor: theme('colors.gray.600')
						},
						'.dark & code': {
							background: theme('colors.gray.700')
						},
						'.dark & pre': {
							background: theme('colors.gray.900')
						}
					}
				},
				xl: {
					css: {
						fontSize: '1.1rem',
						lineHeight: '1.8'
					}
				}
			})
		}
	},

	plugins: [typography, forms, containerQueries]
} satisfies Config;
