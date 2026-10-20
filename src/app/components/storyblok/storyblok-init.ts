// Preserve the existing hook contract while reading the self-hosted content.
export const isStoryblokConfigured = () => true;
export const initStoryblok = () => {};
export const getContentVersion = () => 'published' as const;
