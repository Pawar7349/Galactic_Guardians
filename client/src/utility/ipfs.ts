
export const transformIPFSUrl = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('ipfs://')) {
    return url.replace('ipfs://', 'https://ipfs.io/ipfs/');
  }
  if (!url.startsWith('http')) {
    return `https://ipfs.io/ipfs/${url}`;
  }
  return url;
};
