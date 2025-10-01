declare class Highlight extends Set<Range | StaticRange> { }

interface Window {
	CSS: {
		highlights: Map<string, Highlight>
	}
}

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
namespace App {
	// interface Error {}
	interface Locals {
		theme: 'dark' | 'light' | 'system' | 'naked' | undefined
	}
	// interface PageData {}
	// interface Platform {}

	interface MdsvexFile {
		default: import('svelte/internal').SvelteComponent;
		metadata: Record<string, string>;
	}
}

declare module '*.md' {
	import type { SvelteComponent } from 'svelte'

	export default class Comp extends SvelteComponent { }

	export const metadata: Record<string, unknown>
}

declare module 'css-tree/parser' {
	import { parse } from "css-tree"
	export default parse
}

declare module "css-tree/walker" {
	import { walk } from "css-tree"
	export default walk
}

declare module "css-tree/tokenizer" {
	export function tokenize(
		css: string,
		callback: (type: number, start: number, end: number) => void
	): void;

	// css-tree tokens: https://github.com/csstree/csstree/blob/be5ea1257009960c04cccdb58bb327263e27e3b3/lib/tokenizer/types.js
	// https://www.w3.org/TR/css-syntax-3/
	export const EOF = 0;                 // <EOF-token>
	export const Ident = 1;               // <ident-token>
	export const Function = 2;            // <function-token>
	export const AtKeyword = 3;           // <at-keyword-token>
	export const Hash = 4;                // <hash-token>
	export const String = 5;              // <string-token>
	export const BadString = 6;           // <bad-string-token>
	export const Url = 7;                 // <url-token>
	export const BadUrl = 8;              // <bad-url-token>
	export const Delim = 9;               // <delim-token>
	export const Number = 10;             // <number-token>
	export const Percentage = 11;         // <percentage-token>
	export const Dimension = 12;          // <dimension-token>
	export const WhiteSpace = 13;         // <whitespace-token>
	export const CDO = 14;                // <CDO-token>
	export const CDC = 15;                // <CDC-token>
	export const Colon = 16;              // <colon-token>     :
	export const Semicolon = 17;          // <semicolon-token> ;
	export const Comma = 18;              // <comma-token>     ,
	export const LeftSquareBracket = 19;  // <[-token>
	export const RightSquareBracket = 20; // <]-token>
	export const LeftParenthesis = 21;    // <(-token>
	export const RightParenthesis = 22;   // <)-token>
	export const LeftCurlyBracket = 23;   // <{-token>
	export const RightCurlyBracket = 24;  // <}-token>
	export const Comment = 25;

	export const tokenTypes = {
		EOF,
		Ident,
		Function,
		AtKeyword,
		Hash,
		String,
		BadString,
		Url,
		BadUrl,
		Delim,
		Number,
		Percentage,
		Dimension,
		WhiteSpace,
		CDO,
		CDC,
		Colon,
		Semicolon,
		Comma,
		LeftSquareBracket,
		RightSquareBracket,
		LeftParenthesis,
		RightParenthesis,
		LeftCurlyBracket,
		RightCurlyBracket,
		Comment,
	}
}