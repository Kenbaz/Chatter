export const shareFuncs = () => {
    const copyLinkToClipboard = (postId: string) => {
        try {
            const postUrl = `${window.location.origin}/post/${postId}`;
            navigator.clipboard.writeText(postUrl)
            console.log('Link copied to clipboard');
        } catch (error) {
            console.error('Failed to copy link: ', error)
        }
    };

    const shareOnTwitter = (
      postId: string,
      postTitle: string,
    ) => {
      const postUrl = `${window.location.origin}/post/${postId}`;
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        postTitle
      )}&url=${encodeURIComponent(postUrl)}`;
      window.open(twitterUrl, "_blank");
  };
  

    const shareOnLinkedIn = (postId: string) => {
      const postUrl = `${window.location.origin}/post/${postId}`;
      const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        postUrl
      )}`;
      window.open(linkedInUrl, "_blank");
  };
  
  const shareOnFacebook = (postId: string) => {
    const postUrl = `${window.location.origin}/post/${postId}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      postUrl
    )}`;
    window.open(facebookUrl, "_blank");
  };

    return {copyLinkToClipboard, shareOnTwitter, shareOnLinkedIn, shareOnFacebook}
}