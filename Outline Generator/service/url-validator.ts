const checkUrl = async (url: string) => {
  try {
    const response = await fetch(url);
    if(response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function modifyAndCheckUrl(url: string): Promise<string|null> {
  const isValid = await checkUrl(url);
  if (isValid) {
      return url;
  } else {
      const urlParts = url.replace(/\/$/, '').split('/');
      if (urlParts.length > 3) {
          urlParts.pop();
          const newUrl = urlParts.join('/');
          console.log(`Trying modified URL: ${newUrl}`);
          return await modifyAndCheckUrl(newUrl);
      } else {
          console.log(`No valid URL found after reducing: ${url}`);
          return null;
      }
  }
}

export {modifyAndCheckUrl}