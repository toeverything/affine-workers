# link-preview

A worker used to parse page metadata based on Open Graph Protocol.

```ts
interface ResponseData {
	url: string;
	title?: string;
	siteName?: string;
	description?: string;
	images?: string[];
	mediaType?: string;
	contentType?: string;
	charset?: string;
	videos?: string[];
	favicons?: string[];
}
```

## Usage

```ts
const url = 'https://github.com/toeverything/link-preview';
const response = await fetch(
	'https://link-preview.toeverything.workers.dev',
	{
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			url,
		}),
	},
);
const data = await response.json();
```
