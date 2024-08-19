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
      imageUrl: string
    ) => {
      const postUrl = `${window.location.origin}/post/${postId}`;
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        postTitle
      )}&url=${encodeURIComponent(postUrl)}&image=${encodeURIComponent(
        imageUrl
      )}`;
      window.open(twitterUrl, "_blank");
    };

    const shareOnLinkedIn = (postId: string, imageUrl: string) => {
      const postUrl = `${window.location.origin}/post/${postId}`;
      const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        postUrl
      )}`;
      window.open(linkedInUrl, "_blank");
    };

    return {copyLinkToClipboard, shareOnTwitter, shareOnLinkedIn}
}