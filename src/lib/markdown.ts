export function renderMarkdown(source: string) {
	const escaped = escapeHtml(source.replaceAll('\r\n', '\n').replaceAll('\r', '\n').trim());
	if (!escaped) return '';

	return escaped
		.split(/\n{2,}/)
		.map((block) => {
			const lines = block.split('\n').filter((line) => line.trim() !== '');
			if (lines.length === 0) return '';
			if (lines.every((line) => /^[-*] /.test(line))) {
				const items = lines.map((line) => `<li>${inline(line.slice(2))}</li>`).join('');
				return `<ul>${items}</ul>`;
			}
			const parts: string[] = [];
			const paragraph: string[] = [];
			const flush = () => {
				if (paragraph.length === 0) return;
				parts.push(`<p>${paragraph.map((line) => inline(line)).join('<br>')}</p>`);
				paragraph.length = 0;
			};
			for (const line of lines) {
				const heading = headingTag(line);
				if (heading) {
					flush();
					parts.push(heading);
				} else {
					paragraph.push(line);
				}
			}
			flush();
			return parts.join('');
		})
		.join('');
}

function headingTag(line: string) {
	if (line.startsWith('### ')) return `<h3>${inline(line.slice(4))}</h3>`;
	if (line.startsWith('## ')) return `<h2>${inline(line.slice(3))}</h2>`;
	if (line.startsWith('# ')) return `<h2>${inline(line.slice(2))}</h2>`;
	return null;
}

function inline(value: string) {
	return value
		.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2">$1</a>')
		.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

function escapeHtml(value: string) {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;');
}
