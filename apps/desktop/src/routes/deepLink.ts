export const parseDeepLinkUri = (uri: string): string => {
  try {
    if (!uri.startsWith('sidra://')) {
      return '#/';
    }
    const pathAndQuery = uri.replace(/^sidra:\/\//, '');
    return `#/${pathAndQuery}`;
  } catch (err) {
    console.error('[deepLink] Failed to parse deep link URI:', uri, err);
    return '#/';
  }
};
