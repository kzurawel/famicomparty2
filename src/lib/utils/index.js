export const fetchMarkdownPosts = async () => {
	const allPostFiles = import.meta.glob('/src/routes/blog/**/*.md');
	const iterablePostFiles = Object.entries(allPostFiles);

	const allPosts = await Promise.all(
		iterablePostFiles.map(async ([path, resolver]) => {
			const { metadata } = await resolver();
			const postPath = path.slice(11, -3);
			const pathParts = postPath.split('/');

			return {
				meta: metadata,
				dir: pathParts[2],
				path: pathParts[3]
			};
		})
	);

	return allPosts;
};
